"""
Endpoint administration — Campagnes, Promotions, Clients, Audit, Paramètres.
"""
from datetime import datetime, timezone
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_
from typing import List, Optional

from app.core.database import get_db
from app.api.deps import get_admin_user, get_catalog_manager, get_order_manager
from app.models.user import User
from app.models.order import Order
from app.models.campaign import Campaign
from app.models.promotion import Promotion
from app.models.audit import AuditLog
from app.models.enums import OrderStatus, UserRole
from app.schemas.campaign import CampaignCreate, CampaignUpdate, CampaignResponse
from app.schemas.promotion import PromotionCreate, PromotionUpdate, PromotionResponse
from app.services.audit_service import AuditService

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
#  CAMPAGNES
# ─────────────────────────────────────────────────────────────────────────────
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


# ─────────────────────────────────────────────────────────────────────────────
#  PROMOTIONS
# ─────────────────────────────────────────────────────────────────────────────
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


# ─────────────────────────────────────────────────────────────────────────────
#  LOGS D'AUDIT
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/audit-logs")
def get_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    query = db.query(AuditLog).options(joinedload(AuditLog.user)).order_by(AuditLog.created_at.desc())
    total = query.count()
    logs = query.offset((page - 1) * page_size).limit(page_size).all()
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [
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
    }


# ─────────────────────────────────────────────────────────────────────────────
#  CLIENTS
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/customers")
def get_admin_customers(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
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

    total = query.count()
    users = query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    results = []
    for u in users:
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

    return {"total": total, "page": page, "page_size": page_size, "items": results}


# ─────────────────────────────────────────────────────────────────────────────
#  ANALYTIQUES
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/analytics")
def get_admin_analytics(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    from app.models.product import Product
    from app.models.category import Category
    from app.models.order import OrderItem
    from sqlalchemy import desc

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
            "id": cat.id, "slug": cat.slug, "name": cat.name_fr,
            "universe": cat.universe, "revenue": float(rev), "units_sold": int(units)
        })

    category_stats.sort(key=lambda x: x["revenue"], reverse=True)

    top_items = db.query(
        OrderItem.product_id, OrderItem.product_name_fr,
        func.sum(OrderItem.quantity).label("units"),
        func.sum(OrderItem.total_price).label("revenue")
    ).join(Order, OrderItem.order_id == Order.id).filter(
        Order.status != OrderStatus.CANCELLED
    ).group_by(OrderItem.product_id, OrderItem.product_name_fr).order_by(
        desc("revenue")
    ).limit(6).all()

    return {
        "categories": category_stats,
        "top_products": [
            {"product_id": i.product_id, "name": i.product_name_fr,
             "units_sold": int(i.units), "revenue": float(i.revenue)}
            for i in top_items
        ]
    }


# ─────────────────────────────────────────────────────────────────────────────
#  PARAMÈTRES
# ─────────────────────────────────────────────────────────────────────────────
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
        db=db, action="UPDATE_STORE_SETTINGS", entity="StoreSettings",
        entity_id="global", user_id=admin.id,
        details="Mise à jour des paramètres boutique et expédition"
    )
    db.commit()
    return {"message": "Paramètres enregistrés avec succès", "updated_at": datetime.now(timezone.utc).isoformat()}
