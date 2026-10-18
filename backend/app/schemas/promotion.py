from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from datetime import datetime
from app.models.enums import DiscountType, GenderUniverse

class PromotionBase(BaseModel):
    code: str
    name_fr: str
    name_ar: str
    discount_type: DiscountType
    discount_value: Decimal = Field(..., max_digits=10, decimal_places=2)
    min_order_amount: Decimal = Field(default=Decimal("0.00"), max_digits=10, decimal_places=2)
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    max_uses: Optional[int] = None
    target_universe: Optional[GenderUniverse] = GenderUniverse.UNISEX
    is_active: bool = True

class PromotionCreate(PromotionBase):
    pass

class PromotionUpdate(BaseModel):
    name_fr: Optional[str] = None
    name_ar: Optional[str] = None
    discount_type: Optional[DiscountType] = None
    discount_value: Optional[Decimal] = None
    min_order_amount: Optional[Decimal] = None
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    max_uses: Optional[int] = None
    target_universe: Optional[GenderUniverse] = None
    is_active: Optional[bool] = None

class PromotionResponse(PromotionBase):
    id: int
    current_uses: int
    created_at: datetime

    class Config:
        from_attributes = True

class PromotionValidateRequest(BaseModel):
    code: str
    subtotal: Decimal
    universe: Optional[GenderUniverse] = None

class PromotionValidateResponse(BaseModel):
    is_valid: bool
    code: str
    discount_type: Optional[DiscountType] = None
    discount_value: Optional[Decimal] = None
    calculated_discount: Decimal = Decimal("0.00")
    message: str
