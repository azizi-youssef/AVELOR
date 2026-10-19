from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Numeric
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import DiscountType, GenderUniverse

def _utcnow():
    return datetime.now(timezone.utc)

class Promotion(Base):
    __tablename__ = "promotions"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name_fr = Column(String(100), nullable=False)
    name_ar = Column(String(100), nullable=False)
    discount_type = Column(SQLEnum(DiscountType, name="discount_type"), nullable=False)
    discount_value = Column(Numeric(10, 2), nullable=False)  # 15.00 pour 15% ou 100.00 MAD
    min_order_amount = Column(Numeric(10, 2), default=0.0, nullable=False)
    starts_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    max_uses = Column(Integer, nullable=True)
    current_uses = Column(Integer, default=0, nullable=False)
    target_universe = Column(SQLEnum(GenderUniverse, name="gender_universe"), default=GenderUniverse.UNISEX, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=_utcnow, nullable=False)

    redemptions = relationship("CouponRedemption", back_populates="promotion")

class CouponRedemption(Base):
    __tablename__ = "coupon_redemptions"

    id = Column(Integer, primary_key=True, index=True)
    promotion_id = Column(Integer, ForeignKey("promotions.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    discount_applied = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime, default=_utcnow, nullable=False)

    promotion = relationship("Promotion", back_populates="redemptions")
    order = relationship("Order", back_populates="coupon_redemption")
