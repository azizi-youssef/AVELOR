import re
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List
from decimal import Decimal
from datetime import datetime
from app.models.enums import OrderStatus, PaymentStatus, PaymentMethod

MOROCCAN_PHONE_REGEX = re.compile(r"^(\+212|0)(5|6|7)\d{8}$")

def _validate_moroccan_phone(v: str) -> str:
    cleaned = re.sub(r"[\s\-\.]", "", str(v).strip())
    if not MOROCCAN_PHONE_REGEX.match(cleaned):
        raise ValueError("Numéro de téléphone marocain invalide (ex: +212612345678 ou 0612345678)")
    return cleaned

class OrderItemCreate(BaseModel):
    variant_id: int
    quantity: int = Field(..., gt=0)

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    variant_id: int
    product_name_fr: str
    product_name_ar: str
    sku: str
    size: str
    color_name_fr: str
    unit_price: Decimal
    quantity: int
    total_price: Decimal

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    # Informations client / invité
    customer_name: str
    customer_phone: str
    customer_email: Optional[EmailStr] = None
    shipping_address: str
    shipping_city: str
    shipping_postal_code: Optional[str] = None
    delivery_notes: Optional[str] = None
    
    # Mode de paiement
    payment_method: PaymentMethod = PaymentMethod.CASH_ON_DELIVERY
    coupon_code: Optional[str] = None
    
    # Items
    items: List[OrderItemCreate]

    @field_validator("customer_phone")
    @classmethod
    def check_phone(cls, v: str) -> str:
        return _validate_moroccan_phone(v)

class ShipmentResponse(BaseModel):
    carrier_name: str
    tracking_number: Optional[str] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class PaymentResponse(BaseModel):
    provider: str
    transaction_id: Optional[str] = None
    amount: Decimal
    status: PaymentStatus
    payment_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: Optional[int] = None
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    shipping_address: str
    shipping_city: str
    shipping_postal_code: Optional[str] = None
    delivery_notes: Optional[str] = None
    status: OrderStatus
    payment_status: PaymentStatus
    payment_method: PaymentMethod
    subtotal: Decimal
    shipping_fee: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []
    shipment: Optional[ShipmentResponse] = None
    payment: Optional[PaymentResponse] = None

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    admin_notes: Optional[str] = None
    tracking_number: Optional[str] = None
