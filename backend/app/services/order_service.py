import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.product import ProductVariant, Product, InventoryMovement
from app.models.order import Order, OrderItem, Shipment, Payment
from app.models.promotion import CouponRedemption
from app.models.enums import OrderStatus, PaymentStatus, PaymentMethod, InventoryReason
from app.schemas.order import OrderCreate
from app.services.promotion_service import PromotionService

class OrderService:
    @staticmethod
    def generate_order_number() -> str:
        date_str = datetime.utcnow().strftime("%Y%m")
        unique_suffix = uuid.uuid4().hex[:6].upper()
        return f"AV-{date_str}-{unique_suffix}"

    @classmethod
    def create_order(
        cls,
        db: Session,
        order_in: OrderCreate,
        user_id: Optional[int] = None
    ) -> Order:
        """
        Crée une commande de manière transactionnelle avec vérification de stock
        et calcul strict des montants.
        """
        if not order_in.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Le panier est vide"
            )

        subtotal = Decimal("0.00")
        order_items_to_create = []

        # 1. Vérification des articles et du stock
        for item in order_in.items:
            variant = db.query(ProductVariant).filter(
                ProductVariant.id == item.variant_id,
                ProductVariant.is_active == True
            ).with_for_update().first()

            if not variant:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"La variante {item.variant_id} n'existe pas ou n'est plus active"
                )

            if variant.stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stock insuffisant pour le produit '{variant.product.name_fr}' (Taille: {variant.size}, Couleur: {variant.color_name_fr}). Stock restant: {variant.stock}"
                )

            product = variant.product
            # Prix unitaire effectif (remise produit si active)
            effective_price = product.discount_price if product.discount_price else product.base_price
            item_total = (Decimal(str(effective_price)) * Decimal(str(item.quantity))).quantize(Decimal("0.01"))
            subtotal += item_total

            order_items_to_create.append({
                "variant": variant,
                "product": product,
                "quantity": item.quantity,
                "unit_price": Decimal(str(effective_price)),
                "total_price": item_total
            })

        # 2. Gestion du code promotionnel
        discount_amount = Decimal("0.00")
        applied_promo = None
        if order_in.coupon_code:
            is_valid, msg, discount, promo_obj = PromotionService.validate_and_calculate_discount(
                db=db,
                code=order_in.coupon_code,
                subtotal=subtotal
            )
            if is_valid and promo_obj:
                discount_amount = discount
                applied_promo = promo_obj

        # 3. Calcul des frais de port
        shipping_fee = Decimal("0.00")
        if (subtotal - discount_amount) < Decimal(str(settings.FREE_SHIPPING_THRESHOLD)):
            shipping_fee = Decimal(str(settings.STANDARD_SHIPPING_FEE))

        total_amount = (subtotal - discount_amount + shipping_fee).quantize(Decimal("0.01"))

        # 4. Création de la commande
        order_number = cls.generate_order_number()
        order = Order(
            order_number=order_number,
            user_id=user_id,
            customer_name=order_in.customer_name.strip(),
            customer_phone=order_in.customer_phone.strip(),
            customer_email=str(order_in.customer_email) if order_in.customer_email else None,
            shipping_address=order_in.shipping_address.strip(),
            shipping_city=order_in.shipping_city.strip(),
            shipping_postal_code=order_in.shipping_postal_code,
            delivery_notes=order_in.delivery_notes,
            status=OrderStatus.PENDING,
            payment_status=PaymentStatus.PENDING,
            payment_method=order_in.payment_method,
            subtotal=subtotal,
            shipping_fee=shipping_fee,
            discount_amount=discount_amount,
            total_amount=total_amount,
        )
        db.add(order)
        db.flush()  # Récupère order.id

        # 5. Décrémenter le stock et enregistrer les mouvements d'inventaire
        for item_data in order_items_to_create:
            variant = item_data["variant"]
            product = item_data["product"]
            qty = item_data["quantity"]

            variant.stock -= qty

            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                variant_id=variant.id,
                product_name_fr=product.name_fr,
                product_name_ar=product.name_ar,
                sku=variant.sku,
                size=variant.size,
                color_name_fr=variant.color_name_fr,
                unit_price=item_data["unit_price"],
                quantity=qty,
                total_price=item_data["total_price"]
            )
            db.add(order_item)

            inventory_movement = InventoryMovement(
                variant_id=variant.id,
                quantity=-qty,
                reason=InventoryReason.SALE,
                order_id=order.id,
                reference=f"Commande {order.order_number}"
            )
            db.add(inventory_movement)

        # 6. Enregistrement coupon s'il y a lieu
        if applied_promo:
            applied_promo.current_uses += 1
            redemption = CouponRedemption(
                promotion_id=applied_promo.id,
                order_id=order.id,
                user_id=user_id,
                discount_applied=discount_amount
            )
            db.add(redemption)

        # 7. Création de l'expédition
        shipment = Shipment(
            order_id=order.id,
            carrier_name="AVELOR Express Maroc",
            notes="Livraison standard à domicile"
        )
        db.add(shipment)

        # 8. Création du paiement
        payment = Payment(
            order_id=order.id,
            provider=order_in.payment_method.value,
            amount=total_amount,
            status=PaymentStatus.PENDING
        )
        db.add(payment)

        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def cancel_order(db: Session, order: Order, reason: Optional[str] = None) -> Order:
        """
        Annule une commande et restitue les stocks.
        """
        if order.status in [OrderStatus.SHIPPED, OrderStatus.DELIVERED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Impossible d'annuler une commande déjà expédiée ou livrée"
            )

        if order.status == OrderStatus.CANCELLED:
            return order

        # Restituer les stocks
        for item in order.items:
            variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()
            if variant:
                variant.stock += item.quantity
                movement = InventoryMovement(
                    variant_id=variant.id,
                    quantity=item.quantity,
                    reason=InventoryReason.RETURN,
                    order_id=order.id,
                    reference=f"Annulation commande {order.order_number}"
                )
                db.add(movement)

        order.status = OrderStatus.CANCELLED
        if reason:
            order.admin_notes = f"{order.admin_notes or ''}\n[Annulation]: {reason}".strip()

        db.commit()
        db.refresh(order)
        return order
