from datetime import datetime, timezone, timedelta
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, or_, and_
from typing import List, Optional

from app.core.database import get_db
from app.api.deps import get_admin_user, get_catalog_manager, get_order_manager
from app.models.user import User
from app.models.product import Product, ProductVariant, ProductImage, InventoryMovement
from app.models.category import Category
from app.models.order import Order, OrderItem, Shipment, Payment
from app.models.promotion import Promotion
from app.models.campaign import Campaign
from app.models.audit import AuditLog
from app.models.enums import OrderStatus, PaymentStatus, InventoryReason, GenderUniverse, UserRole
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse,
    ProductVariantCreate, ProductVariantResponse,
    ProductImageCreate, ProductImageResponse
)
from app.schemas.order import OrderResponse, OrderStatusUpdate
from app.schemas.campaign import CampaignCreate, CampaignUpdate, CampaignResponse
from app.schemas.promotion import PromotionCreate, PromotionUpdate, PromotionResponse
from app.services.audit_service import AuditService
from app.services.order_service import OrderService

router = APIRouter()

# ==========================================
# 1. TABLEAU DE BORD (DASHBOARD STATS)
# ==========================================
@router.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    total_orders = db.query(Order).count()
    
    # Chiffre d'affaires : somme des total_amount des commandes non annulées
    revenue_query = db.query(func.sum(Order.total_amount)).filter(
        Order.status != OrderStatus.CANCELLED
    ).scalar()
    total_revenue = Decimal(str(revenue_query)) if revenue_query else Decimal("0.00")

    # Panier moyen
    valid_orders_count = db.query(Order).filter(Order.status != OrderStatus.CANCELLED).count()
    average_cart_value = (
        (total_revenue / Decimal(str(valid_orders_count))).quantize(Decimal("0.01"))
        if valid_orders_count > 0
        else Decimal("0.00")
    )

    # Commandes à traiter (PENDING ou CONFIRMED ou PROCESSING)
    pending_orders = db.query(Order).filter(
        Order.status.in_([OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING])
    ).count()

    # Produits en stock faible (variantes avec stock < 5)
    low_stock_variants = db.query(ProductVariant).options(
        joinedload(ProductVariant.product)
    ).filter(
        ProductVariant.is_active == True,
        ProductVariant.stock < 5,
        ProductVariant.stock > 0
    ).limit(10).all()

    # Rupture totale de stock
    out_of_stock_count = db.query(ProductVariant).filter(
        ProductVariant.is_active == True,
        ProductVariant.stock == 0
    ).count()

    total_low_stock_count = db.query(ProductVariant).filter(
        ProductVariant.is_active == True,
        ProductVariant.stock < 5
    ).count()

    # Répartition par statut de commande
    status_counts = {}
    for st in OrderStatus:
        status_counts[st.value] = db.query(Order).filter(Order.status == st).count()

    # Répartition par univers (Homme vs Femme) sur les commandes non annulées
    men_revenue_query = db.query(func.sum(OrderItem.total_price)).join(
        Order, OrderItem.order_id == Order.id
    ).join(
        Product, OrderItem.product_id == Product.id
    ).filter(
        Order.status != OrderStatus.CANCELLED,
        Product.universe == GenderUniverse.MEN
    ).scalar()
    men_revenue = Decimal(str(men_revenue_query)) if men_revenue_query else Decimal("0.00")

    women_revenue_query = db.query(func.sum(OrderItem.total_price)).join(
        Order, OrderItem.order_id == Order.id
    ).join(
        Product, OrderItem.product_id == Product.id
    ).filter(
        Order.status != OrderStatus.CANCELLED,
        Product.universe == GenderUniverse.WOMEN
    ).scalar()
    women_revenue = Decimal(str(women_revenue_query)) if women_revenue_query else Decimal("0.00")

    # Chronologie des 7 derniers jours (ventes quotidiennes)
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    sales_timeline = []
    for i in range(6, -1, -1):
        day_date = (now - timedelta(days=i)).date()
        day_start = datetime.combine(day_date, datetime.min.time())
        day_end = datetime.combine(day_date, datetime.max.time())
        
        day_rev = db.query(func.sum(Order.total_amount)).filter(
            Order.status != OrderStatus.CANCELLED,
            Order.created_at >= day_start,
            Order.created_at <= day_end
        ).scalar()
        day_orders = db.query(Order).filter(
            Order.created_at >= day_start,
            Order.created_at <= day_end
        ).count()
        sales_timeline.append({
            "date": day_date.strftime("%d/%m"),
            "full_date": day_date.isoformat(),
            "revenue": float(day_rev) if day_rev else 0.0,
            "orders": day_orders
        })

    # Total clients et produits actifs
    total_customers = db.query(User).filter(User.role == UserRole.CUSTOMER).count()
    total_products = db.query(Product).filter(Product.is_active == True).count()

    # 5 Commandes récentes
    recent_orders = db.query(Order).options(
        joinedload(Order.items)
    ).order_by(Order.created_at.desc()).limit(6).all()

    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "average_cart_value": average_cart_value,
        "pending_orders": pending_orders,
        "low_stock_count": total_low_stock_count,
        "out_of_stock_count": out_of_stock_count,
        "total_customers": total_customers,
        "total_products": total_products,
        "status_counts": status_counts,
        "sales_timeline": sales_timeline,
        "universe_breakdown": {
            "men_revenue": men_revenue,
            "women_revenue": women_revenue,
        },
        "low_stock_items": [
            {
                "id": v.id,
                "product_name": v.product.name_fr,
                "sku": v.sku,
                "size": v.size,
                "color": v.color_name_fr,
                "stock": v.stock
            } for v in low_stock_variants
        ],
        "recent_orders": [
            {
                "id": o.id,
                "order_number": o.order_number,
                "customer_name": o.customer_name,
                "customer_city": o.shipping_city,
                "total_amount": o.total_amount,
                "status": o.status,
                "created_at": o.created_at
            } for o in recent_orders
        ]
    }

# ==========================================
# 2. GESTION DES PRODUITS (CATALOGUE)
# ==========================================
@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    prod_in: ProductCreate,
    req: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_catalog_manager)
):
    # Vérification SKU
    existing = db.query(Product).filter(
        or_(Product.sku == prod_in.sku, Product.slug == prod_in.slug)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Un produit avec ce SKU ou Slug existe déjà")

    product = Product(
        sku=prod_in.sku,
        slug=prod_in.slug,
        name_fr=prod_in.name_fr,
        name_ar=prod_in.name_ar,
        short_desc_fr=prod_in.short_desc_fr,
        short_desc_ar=prod_in.short_desc_ar,
        description_fr=prod_in.description_fr,
        description_ar=prod_in.description_ar,
        base_price=prod_in.base_price,
        discount_price=prod_in.discount_price,
        universe=prod_in.universe,
        category_id=prod_in.category_id,
        is_active=prod_in.is_active,
        is_featured=prod_in.is_featured,
        is_new=prod_in.is_new
    )
    db.add(product)
    db.flush()

    for v in prod_in.variants:
        variant = ProductVariant(
            product_id=product.id,
            sku=v.sku,
            size=v.size,
            color_name_fr=v.color_name_fr,
            color_name_ar=v.color_name_ar,
            color_code=v.color_code,
            stock=v.stock,
            is_active=v.is_active
        )
        db.add(variant)

    for idx, img in enumerate(prod_in.images):
        p_img = ProductImage(
            product_id=product.id,
            url=img.url,
            alt_text_fr=img.alt_text_fr or prod_in.name_fr,
            alt_text_ar=img.alt_text_ar or prod_in.name_ar,
            is_cover=img.is_cover or (idx == 0),
            sort_order=img.sort_order or idx
        )
        db.add(p_img)

    AuditService.log(
        db=db,
        action="CREATE_PRODUCT",
        entity="Product",
        entity_id=str(product.id),
        user_id=user.id,
        details=f"Création produit {product.name_fr} ({product.sku})"
    )

    db.commit()
    db.refresh(product)
    return product

@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    prod_update: ProductUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_catalog_manager)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")

    update_data = prod_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(product, field, val)

    AuditService.log(
        db=db,
        action="UPDATE_PRODUCT",
        entity="Product",
        entity_id=str(product.id),
        user_id=user.id,
        details=f"Mise à jour produit {product.name_fr}"
    )

    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_catalog_manager)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")

    # Désactivation logique recommandée pour préserver l'historique des commandes
    product.is_active = False
    
    AuditService.log(
        db=db,
        action="ARCHIVE_PRODUCT",
        entity="Product",
        entity_id=str(product.id),
        user_id=user.id,
        details=f"Désactivation du produit {product.name_fr}"
    )
    db.commit()
    return {"message": "Produit archivé avec succès"}

@router.put("/variants/{variant_id}/stock")
def update_variant_stock(
    variant_id: int,
    data: dict,
    db: Session = Depends(get_db),
    user: User = Depends(get_catalog_manager)
):
    variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Variante non trouvée")
    new_stock = data.get("stock")
    if new_stock is None or int(new_stock) < 0:
        raise HTTPException(status_code=400, detail="Stock invalide")
    diff = int(new_stock) - variant.stock
    variant.stock = int(new_stock)
    inv = InventoryMovement(
        variant_id=variant.id,
        quantity=diff,
        reason=InventoryReason.ADJUSTMENT,
        reference=f"admin_{user.id}"
    )
    db.add(inv)
    db.commit()
    db.refresh(variant)
    return {"message": "Stock mis à jour", "stock": variant.stock, "variant_id": variant.id}

# ==========================================
# 3. GESTION DES COMMANDES (ADMIN)
# ==========================================
@router.get("/orders", response_model=List[OrderResponse])
def get_admin_orders(
    status: Optional[OrderStatus] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_order_manager)
):
    query = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.shipment),
        joinedload(Order.payment)
    )

    if status:
        query = query.filter(Order.status == status)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Order.order_number.ilike(search_term),
                Order.customer_name.ilike(search_term),
                Order.customer_phone.ilike(search_term),
                Order.customer_email.ilike(search_term)
            )
        )

    return query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

@router.put("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_order_manager)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande non trouvée")

    old_status = order.status
    if status_update.status:
        # Si on passe à Annulé, restituer les stocks
        if status_update.status == OrderStatus.CANCELLED and old_status != OrderStatus.CANCELLED:
            OrderService.cancel_order(db=db, order=order, reason=status_update.admin_notes)
        else:
            order.status = status_update.status

    if status_update.payment_status:
        order.payment_status = status_update.payment_status
        if order.payment:
            order.payment.status = status_update.payment_status
            if status_update.payment_status == PaymentStatus.PAID:
                order.payment.payment_date = datetime.now(timezone.utc)

    if status_update.tracking_number and order.shipment:
        order.shipment.tracking_number = status_update.tracking_number
        if not order.shipment.shipped_at:
            order.shipment.shipped_at = datetime.now(timezone.utc)

    if status_update.admin_notes:
        order.admin_notes = f"{order.admin_notes or ''}\n{status_update.admin_notes}".strip()

    AuditService.log(
        db=db,
        action="UPDATE_ORDER_STATUS",
        entity="Order",
        entity_id=str(order.id),
        user_id=user.id,
        details=f"Changement statut commande {order.order_number}: {old_status} -> {order.status}"
    )

    db.commit()
    db.refresh(order)
    return order

# ==========================================
# 4. GESTION DES CAMPAGNES & BANNIÈRES
# ==========================================
@router.get("/campaigns", response_model=List[CampaignResponse])
def get_all_campaigns(
    db: Session = Depends(get_db),
    user: User = Depends(get_catalog_manager)
):
    return db.query(Campaign).order_by(Campaign.sort_order.asc()).all()

@router.post("/campaigns", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
def create_campaign(
    campaign_in: CampaignCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_catalog_manager)
):
    campaign = Campaign(**campaign_in.model_dump())
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign

@router.put("/campaigns/{campaign_id}", response_model=CampaignResponse)
def update_campaign(
    campaign_id: int,
    campaign_in: CampaignUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_catalog_manager)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campagne non trouvée")

    for k, v in campaign_in.model_dump(exclude_unset=True).items():
        setattr(campaign, k, v)

    db.commit()
    db.refresh(campaign)
    return campaign

@router.delete("/campaigns/{campaign_id}")
def delete_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_catalog_manager)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campagne non trouvée")
    db.delete(campaign)
    db.commit()
    return {"message": "Campagne supprimée"}

# ==========================================
# 5. GESTION DES PROMOTIONS
# ==========================================
@router.get("/promotions", response_model=List[PromotionResponse])
def get_admin_promotions(
    db: Session = Depends(get_db),
    user: User = Depends(get_catalog_manager)
):
    return db.query(Promotion).order_by(Promotion.created_at.desc()).all()

@router.post("/promotions", response_model=PromotionResponse, status_code=status.HTTP_201_CREATED)
def create_promotion(
    promo_in: PromotionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_catalog_manager)
):
    existing = db.query(Promotion).filter(Promotion.code == promo_in.code.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ce code promotionnel existe déjà")

    promo = Promotion(
        code=promo_in.code.upper(),
        name_fr=promo_in.name_fr,
        name_ar=promo_in.name_ar,
        discount_type=promo_in.discount_type,
        discount_value=promo_in.discount_value,
        min_order_amount=promo_in.min_order_amount,
        starts_at=promo_in.starts_at,
        expires_at=promo_in.expires_at,
        max_uses=promo_in.max_uses,
        target_universe=promo_in.target_universe,
        is_active=promo_in.is_active
    )
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return promo

@router.put("/promotions/{promo_id}/toggle")
def toggle_promotion(
    promo_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_catalog_manager)
):
    promo = db.query(Promotion).filter(Promotion.id == promo_id).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Promotion non trouvée")
    promo.is_active = not promo.is_active
    db.commit()
    return {"message": f"Promotion {'activée' if promo.is_active else 'désactivée'}", "is_active": promo.is_active}

# ==========================================
# 6. LOGS D'AUDIT SÉCURITÉ
# ==========================================
@router.get("/audit-logs")
def get_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    logs = db.query(AuditLog).options(joinedload(AuditLog.user)).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "action": l.action,
            "entity": l.entity,
            "entity_id": l.entity_id,
            "user_email": l.user.email if l.user else "System",
            "details": l.details,
            "ip_address": l.ip_address,
            "created_at": l.created_at
        } for l in logs
    ]

# ==========================================
# 7. GESTION DES CLIENTS (CUSTOMERS)
# ==========================================
@router.get("/customers")
def get_admin_customers(
    search: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    query = db.query(User).filter(User.role == UserRole.CUSTOMER)
    if search:
        st = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.email.ilike(st),
                User.first_name.ilike(st),
                User.last_name.ilike(st),
                User.phone.ilike(st)
            )
        )
    users = query.order_by(User.created_at.desc()).limit(limit).all()

    results = []
    for u in users:
        # Aggregated order stats for this user
        orders_q = db.query(Order).filter(Order.user_id == u.id)
        order_count = orders_q.count()
        total_spent = db.query(func.sum(Order.total_amount)).filter(
            Order.user_id == u.id,
            Order.status != OrderStatus.CANCELLED
        ).scalar() or Decimal("0.00")
        last_order = orders_q.order_by(Order.created_at.desc()).first()

        full_name = f"{u.first_name or ''} {u.last_name or ''}".strip()
        if not full_name and last_order:
            full_name = last_order.customer_name

        city = last_order.shipping_city if last_order else (u.addresses[0].city if u.addresses else "Maroc")

        results.append({
            "id": u.id,
            "email": u.email,
            "name": full_name or u.email.split("@")[0].capitalize(),
            "phone": u.phone or (last_order.customer_phone if last_order else ""),
            "city": city,
            "role": u.role,
            "is_active": u.is_active,
            "total_orders": order_count,
            "total_spent": float(total_spent),
            "last_order_date": last_order.created_at if last_order else None,
            "created_at": u.created_at
        })

    return results

# ==========================================
# 8. GESTION DE L'INVENTAIRE & STOCKS
# ==========================================
@router.get("/inventory")
def get_admin_inventory(
    low_stock_only: bool = False,
    universe: Optional[GenderUniverse] = None,
    search: Optional[str] = None,
    limit: int = 150,
    db: Session = Depends(get_db),
    user: User = Depends(get_catalog_manager)
):
    query = db.query(ProductVariant).options(
        joinedload(ProductVariant.product).joinedload(Product.category)
    ).join(Product, ProductVariant.product_id == Product.id)

    if low_stock_only:
        query = query.filter(ProductVariant.stock < 5)

    if universe:
        query = query.filter(Product.universe == universe)

    if search:
        st = f"%{search.strip()}%"
        query = query.filter(
            or_(
                ProductVariant.sku.ilike(st),
                Product.name_fr.ilike(st),
                Product.name_ar.ilike(st),
                ProductVariant.size.ilike(st),
                ProductVariant.color_name_fr.ilike(st)
            )
        )

    variants = query.order_by(ProductVariant.stock.asc()).limit(limit).all()

    return [
        {
            "id": v.id,
            "product_id": v.product_id,
            "product_name": v.product.name_fr if v.product else "",
            "product_sku": v.product.sku if v.product else "",
            "sku": v.sku,
            "size": v.size,
            "color_name": v.color_name_fr,
            "color_code": v.color_code,
            "stock": v.stock,
            "base_price": float(v.product.base_price) if v.product else 0.0,
            "discount_price": float(v.product.discount_price) if (v.product and v.product.discount_price) else None,
            "universe": v.product.universe if v.product else "UNISEX",
            "category_name": v.product.category.name_fr if (v.product and v.product.category) else "Général",
            "is_active": v.is_active and (v.product.is_active if v.product else True),
            "status": "OUT_OF_STOCK" if v.stock == 0 else ("LOW_STOCK" if v.stock < 5 else "IN_STOCK")
        } for v in variants
    ]

@router.get("/inventory/movements")
def get_inventory_movements(
    limit: int = 50,
    db: Session = Depends(get_db),
    user: User = Depends(get_catalog_manager)
):
    movements = db.query(InventoryMovement).options(
        joinedload(InventoryMovement.variant).joinedload(ProductVariant.product)
    ).order_by(InventoryMovement.created_at.desc()).limit(limit).all()

    return [
        {
            "id": m.id,
            "variant_id": m.variant_id,
            "sku": m.variant.sku if m.variant else "Inconnu",
            "product_name": m.variant.product.name_fr if (m.variant and m.variant.product) else "",
            "quantity": m.quantity,
            "reason": m.reason,
            "order_id": m.order_id,
            "reference": m.reference,
            "created_at": m.created_at
        } for m in movements
    ]

# ==========================================
# 9. STATISTIQUES AVANCÉES (ANALYTICS)
# ==========================================
@router.get("/analytics")
def get_admin_analytics(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    # Performance par catégorie
    categories = db.query(Category).all()
    category_stats = []
    for cat in categories:
        rev = db.query(func.sum(OrderItem.total_price)).join(
            Order, OrderItem.order_id == Order.id
        ).join(
            Product, OrderItem.product_id == Product.id
        ).filter(
            Order.status != OrderStatus.CANCELLED,
            Product.category_id == cat.id
        ).scalar() or Decimal("0.00")

        units = db.query(func.sum(OrderItem.quantity)).join(
            Order, OrderItem.order_id == Order.id
        ).join(
            Product, OrderItem.product_id == Product.id
        ).filter(
            Order.status != OrderStatus.CANCELLED,
            Product.category_id == cat.id
        ).scalar() or 0

        category_stats.append({
            "id": cat.id,
            "slug": cat.slug,
            "name": cat.name_fr,
            "universe": cat.universe,
            "revenue": float(rev),
            "units_sold": int(units)
        })

    category_stats.sort(key=lambda x: x["revenue"], reverse=True)

    # Top 5 produits vendus
    top_items = db.query(
        OrderItem.product_id,
        OrderItem.product_name_fr,
        func.sum(OrderItem.quantity).label("units"),
        func.sum(OrderItem.total_price).label("revenue")
    ).join(Order, OrderItem.order_id == Order.id).filter(
        Order.status != OrderStatus.CANCELLED
    ).group_by(OrderItem.product_id, OrderItem.product_name_fr).order_by(
        desc("revenue")
    ).limit(6).all()

    top_products = [
        {
            "product_id": item.product_id,
            "name": item.product_name_fr,
            "units_sold": int(item.units),
            "revenue": float(item.revenue)
        } for item in top_items
    ]

    return {
        "categories": category_stats,
        "top_products": top_products
    }

# ==========================================
# 10. PARAMÈTRES & UTILISATEURS AUTORISÉS
# ==========================================
@router.get("/settings")
def get_admin_settings(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    staff_users = db.query(User).filter(User.role != UserRole.CUSTOMER).all()
    return {
        "store": {
            "name": "AVELOR MAISON",
            "tagline": "Haute Couture & Prêt-à-Porter d'Exception",
            "currency": "MAD",
            "contact_email": "conciergerie@avelor.ma",
            "contact_phone": "+212 5 22 00 00 00",
            "standard_shipping_fee": 40.0,
            "free_shipping_threshold": 1000.0,
            "return_policy_days": 14,
            "cod_enabled": True,
            "maintenance_mode": False
        },
        "authorized_users": [
            {
                "id": u.id,
                "email": u.email,
                "name": f"{u.first_name or ''} {u.last_name or ''}".strip() or u.email,
                "role": u.role,
                "is_active": u.is_active,
                "created_at": u.created_at
            } for u in staff_users
        ]
    }

@router.put("/settings")
def update_admin_settings(
    data: dict,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    AuditService.log(
        db=db,
        action="UPDATE_STORE_SETTINGS",
        entity="StoreSettings",
        entity_id="global",
        user_id=admin.id,
        details="Mise à jour des paramètres boutique et expédition"
    )
    db.commit()
    return {"message": "Paramètres enregistrés avec succès", "updated_at": datetime.now(timezone.utc).isoformat()}

