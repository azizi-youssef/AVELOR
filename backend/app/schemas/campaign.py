from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.enums import GenderUniverse

class CampaignBase(BaseModel):
    title_fr: str
    title_ar: str
    subtitle_fr: Optional[str] = None
    subtitle_ar: Optional[str] = None
    button_text_fr: Optional[str] = "Découvrir la collection"
    button_text_ar: Optional[str] = "اكتشف التشكيلة"
    link_url: str
    desktop_image: str
    mobile_image: Optional[str] = None
    target_universe: GenderUniverse = GenderUniverse.UNISEX
    is_active: bool = True
    sort_order: int = 0
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class CampaignCreate(CampaignBase):
    pass

class CampaignUpdate(BaseModel):
    title_fr: Optional[str] = None
    title_ar: Optional[str] = None
    subtitle_fr: Optional[str] = None
    subtitle_ar: Optional[str] = None
    button_text_fr: Optional[str] = None
    button_text_ar: Optional[str] = None
    link_url: Optional[str] = None
    desktop_image: Optional[str] = None
    mobile_image: Optional[str] = None
    target_universe: Optional[GenderUniverse] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class CampaignResponse(CampaignBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
