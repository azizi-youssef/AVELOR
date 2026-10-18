from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal
from datetime import datetime
from app.models.enums import GenderUniverse
from app.schemas.category import CategoryResponse

class ProductImageBase(BaseModel):
    url: str
    alt_text_fr: Optional[str] = None
    alt_text_ar: Optional[str] = None
    is_cover: bool = False
    sort_order: int = 0

class ProductImageCreate(ProductImageBase):
    pass

class ProductImageResponse(ProductImageBase):
    id: int
    product_id: int

    class Config:
        from_attributes = True

class ProductVariantBase(BaseModel):
    sku: str
    size: str
    color_name_fr: str
    color_name_ar: str
    color_code: str
    stock: int = 0
    is_active: bool = True

class ProductVariantCreate(ProductVariantBase):
    pass

class ProductVariantResponse(ProductVariantBase):
    id: int
    product_id: int

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    sku: str
    slug: str
    name_fr: str
    name_ar: str
    short_desc_fr: Optional[str] = None
    short_desc_ar: Optional[str] = None
    description_fr: Optional[str] = None
    description_ar: Optional[str] = None
    base_price: Decimal = Field(..., max_digits=10, decimal_places=2)
    discount_price: Optional[Decimal] = Field(None, max_digits=10, decimal_places=2)
    universe: GenderUniverse
    category_id: int
    is_active: bool = True
    is_featured: bool = False
    is_new: bool = True

class ProductCreate(ProductBase):
    variants: List[ProductVariantCreate] = []
    images: List[ProductImageCreate] = []

class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    slug: Optional[str] = None
    name_fr: Optional[str] = None
    name_ar: Optional[str] = None
    short_desc_fr: Optional[str] = None
    short_desc_ar: Optional[str] = None
    description_fr: Optional[str] = None
    description_ar: Optional[str] = None
    base_price: Optional[Decimal] = None
    discount_price: Optional[Decimal] = None
    universe: Optional[GenderUniverse] = None
    category_id: Optional[int] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_new: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None
    images: List[ProductImageResponse] = []
    variants: List[ProductVariantResponse] = []

    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
