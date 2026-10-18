from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.enums import GenderUniverse

class CategoryBase(BaseModel):
    slug: str
    name_fr: str
    name_ar: str
    description_fr: Optional[str] = None
    description_ar: Optional[str] = None
    image_url: Optional[str] = None
    universe: GenderUniverse = GenderUniverse.UNISEX
    parent_id: Optional[int] = None
    is_active: bool = True
    sort_order: int = 0

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    slug: Optional[str] = None
    name_fr: Optional[str] = None
    name_ar: Optional[str] = None
    description_fr: Optional[str] = None
    description_ar: Optional[str] = None
    image_url: Optional[str] = None
    universe: Optional[GenderUniverse] = None
    parent_id: Optional[int] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
