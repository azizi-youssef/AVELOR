from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from app.core.database import get_db
from app.api.deps import get_current_user, get_current_user_optional
from app.models.user import User
from app.models.order import Order
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order_service import OrderService

router = APIRouter()

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    user_id = current_user.id if current_user else None
    return OrderService.create_order(db=db, order_in=order_in, user_id=user_id)

@router.get("/track/{order_number}", response_model=OrderResponse)
def track_order(
    order_number: str,
    phone: Optional[str] = Query(None, description="Téléphone pour confirmation si commande invité"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.shipment),
        joinedload(Order.payment)
    ).filter(Order.order_number == order_number.strip().upper())

    order = query.first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Commande introuvable")

    # Sécurité : Si l'utilisateur est connecté, il doit être le propriétaire ou admin
    if current_user:
        if order.user_id and order.user_id != current_user.id and current_user.role.value != "ADMIN":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès interdit")
    else:
        # Pour un invité, vérification du numéro de téléphone
        if phone:
            normalized_db_phone = order.customer_phone.replace(" ", "").replace("-", "")
            normalized_req_phone = phone.replace(" ", "").replace("-", "")
            if normalized_db_phone != normalized_req_phone:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Numéro de téléphone non correspondant")
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Numéro de téléphone requis pour le suivi invité")

    return order

@router.get("/my-orders", response_model=List[OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    orders = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.shipment),
        joinedload(Order.payment)
    ).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders
