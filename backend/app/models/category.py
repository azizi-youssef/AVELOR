from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import GenderUniverse

def _utcnow():
    return datetime.now(timezone.utc)

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    name_fr = Column(String(150), nullable=False)
    name_ar = Column(String(150), nullable=False)
    description_fr = Column(Text, nullable=True)
    description_ar = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    universe = Column(SQLEnum(GenderUniverse, name="gender_universe"), default=GenderUniverse.UNISEX, nullable=False, index=True)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=_utcnow, nullable=False)

    parent = relationship("Category", remote_side=[id], backref="children")
    products = relationship("Product", back_populates="category")
