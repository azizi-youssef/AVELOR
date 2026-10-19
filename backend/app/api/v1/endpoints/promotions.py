from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.limiter import limiter
from app.schemas.promotion import PromotionValidateRequest, PromotionValidateResponse
from app.services.promotion_service import PromotionService

router = APIRouter()

@router.post("/validate", response_model=PromotionValidateResponse)
@limiter.limit("10/minute")
def validate_coupon(
    request: Request,
    req: PromotionValidateRequest,
    db: Session = Depends(get_db)
):
    is_valid, msg, discount, promo = PromotionService.validate_and_calculate_discount(
        db=db,
        code=req.code,
        subtotal=req.subtotal,
        universe=req.universe
    )

    return {
        "is_valid": is_valid,
        "code": req.code,
        "discount_type": promo.discount_type if promo else None,
        "discount_value": promo.discount_value if promo else None,
        "calculated_discount": discount,
        "message": msg
    }
