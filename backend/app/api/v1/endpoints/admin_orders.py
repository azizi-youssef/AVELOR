"""
Endpoint administration — Gestion des commandes.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import List, Optional

from app.core.database import get_db
from app.api.deps import get_order_manager
from app.models.user import User
from app.models.order import Order, Shipment, Payment
from app.models.enums import OrderStatus, PaymentStatus
from app.schemas.order import OrderResponse, OrderStatusUpdate
from app.services.audit_service import AuditService
from app.services.order_service import OrderService

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
#  LISTE DES COMMANDES (paginée)
# ─────────────────────────────────────────────────────────────────────────────
@router.get("", response_model=List[OrderResponse])
def get_admin_orders(
    status: Optional[OrderStatus] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
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


# ─────────────────────────────────────────────────────────────────────────────
#  MISE À JOUR STATUT / SUIVI
# ─────────────────────────────────────────────────────────────────────────────
@router.put("/{order_id}/status", response_model=OrderResponse)
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
        db=db, action="UPDATE_ORDER_STATUS", entity="Order",
        entity_id=str(order.id), user_id=user.id,
        details=f"Changement statut commande {order.order_number}: {old_status} -> {order.status}"
    )
    db.commit()
    db.refresh(order)
    return order
