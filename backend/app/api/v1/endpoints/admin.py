from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, or_
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
from app.models.enums import OrderStatus, PaymentStatus, InventoryReason, GenderUniverse
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

    # Commandes à traiter (PENDING ou CONFIRMED ou PROCESSING)
    pending_orders = db.query(Order).filter(
        Order.status.in_([OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING])
    ).count()

    # Produits en stock faible (variantes avec stock < 5)
    low_stock_variants = db.query(ProductVariant).options(
        joinedload(ProductVariant.product)
    ).filter(
        ProductVariant.is_active == True,
        ProductVariant.stock < 5
    ).limit(10).all()

    # 5 Commandes récentes
    recent_orders = db.query(Order).options(
        joinedload(Order.items)
    ).order_by(Order.created_at.desc()).limit(5).all()

    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "pending_orders": pending_orders,
        "low_stock_count": len(low_stock_variants),
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

# ==========================================
# 3. GESTION DES COMMANDES (ADMIN)
# ==========================================
@router.get("/orders", response_model=List[OrderResponse])
def get_admin_orders(
    status: Optional[OrderStatus] = None,
    search: Optional[str] = None,
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

    return query.order_by(Order.created_at.desc()).all()

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
                order.payment.payment_date = datetime.utcnow()

    if status_update.tracking_number and order.shipment:
        order.shipment.tracking_number = status_update.tracking_number
        if not order.shipment.shipped_at:
            order.shipment.shipped_at = datetime.utcnow()

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
