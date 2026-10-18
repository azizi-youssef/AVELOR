from datetime import datetime
from decimal import Decimal
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models.promotion import Promotion
from app.models.enums import DiscountType, GenderUniverse

class PromotionService:
    @staticmethod
    def validate_and_calculate_discount(
        db: Session,
        code: str,
        subtotal: Decimal,
        universe: Optional[GenderUniverse] = None
    ) -> Tuple[bool, str, Decimal, Optional[Promotion]]:
        """
        Valide un code promotionnel et calcule le montant exact de la remise.
        Retourne (is_valid, message, discount_amount, promotion_obj)
        """
        if not code:
            return False, "Aucun code fourni", Decimal("0.00"), None

        promo = db.query(Promotion).filter(
            Promotion.code == code.strip().upper(),
            Promotion.is_active == True
        ).first()

        if not promo:
            return False, "Code promotionnel invalide ou inexistant", Decimal("0.00"), None

        now = datetime.utcnow()
        if promo.starts_at and now < promo.starts_at:
            return False, "Ce code promo n'est pas encore actif", Decimal("0.00"), None

        if promo.expires_at and now > promo.expires_at:
            return False, "Ce code promo a expiré", Decimal("0.00"), None

        if promo.max_uses and promo.current_uses >= promo.max_uses:
            return False, "Ce code promo a atteint sa limite d'utilisation", Decimal("0.00"), None

        if subtotal < promo.min_order_amount:
            return False, f"Le montant minimum requis pour ce code est de {promo.min_order_amount} MAD", Decimal("0.00"), None

        if promo.target_universe and promo.target_universe != GenderUniverse.UNISEX:
            if universe and universe != promo.target_universe:
                return False, f"Ce code promo est réservé à l'univers {promo.target_universe.value}", Decimal("0.00"), None

        # Calcul de la réduction
        discount = Decimal("0.00")
        if promo.discount_type == DiscountType.PERCENTAGE:
            discount = (subtotal * promo.discount_value) / Decimal("100.00")
        elif promo.discount_type == DiscountType.FIXED:
            discount = promo.discount_value

        # La réduction ne peut pas excéder le montant total
        if discount > subtotal:
            discount = subtotal

        # Arrondi à 2 décimales
        discount = discount.quantize(Decimal("0.01"))

        return True, "Code promotionnel appliqué avec succès", discount, promo
