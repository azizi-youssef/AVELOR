from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum as SQLEnum
from app.core.database import Base
from app.models.enums import GenderUniverse

def _utcnow():
    return datetime.now(timezone.utc)

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    title_fr = Column(String(200), nullable=False)
    title_ar = Column(String(200), nullable=False)
    subtitle_fr = Column(Text, nullable=True)
    subtitle_ar = Column(Text, nullable=True)
    button_text_fr = Column(String(100), default="Découvrir la collection")
    button_text_ar = Column(String(100), default="اكتشف التشكيلة")
    link_url = Column(String(255), nullable=False)
    desktop_image = Column(String(500), nullable=False)
    mobile_image = Column(String(500), nullable=True)
    target_universe = Column(SQLEnum(GenderUniverse, name="gender_universe"), default=GenderUniverse.UNISEX, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    sort_order = Column(Integer, default=0, nullable=False)
    starts_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=_utcnow, nullable=False)
