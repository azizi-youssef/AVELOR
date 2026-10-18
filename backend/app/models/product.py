from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Numeric
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import GenderUniverse, InventoryReason

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    slug = Column(String(200), unique=True, index=True, nullable=False)
    name_fr = Column(String(255), nullable=False, index=True)
    name_ar = Column(String(255), nullable=False, index=True)
    short_desc_fr = Column(Text, nullable=True)
    short_desc_ar = Column(Text, nullable=True)
    description_fr = Column(Text, nullable=True)
    description_ar = Column(Text, nullable=True)
    
    # Prix en MAD (Dirhams marocains) avec Numeric(10, 2)
    base_price = Column(Numeric(10, 2), nullable=False)
    discount_price = Column(Numeric(10, 2), nullable=True)
    
    universe = Column(SQLEnum(GenderUniverse), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_featured = Column(Boolean, default=False, nullable=False, index=True)
    is_new = Column(Boolean, default=True, nullable=False, index=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.sort_order")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    url = Column(String(500), nullable=False)
    alt_text_fr = Column(String(255), nullable=True)
    alt_text_ar = Column(String(255), nullable=True)
    is_cover = Column(Boolean, default=False, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

    product = relationship("Product", back_populates="images")

class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    size = Column(String(50), nullable=False)   # XS, S, M, L, XL, 38, 40, 42, TU
    color_name_fr = Column(String(50), nullable=False)  # Noir, Blanc, Beige, Bleu Marine
    color_name_ar = Column(String(50), nullable=False)  # أسود, أبيض, بيج, كحلي
    color_code = Column(String(20), nullable=False)     # #000000, #FFFFFF, etc.
    stock = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    product = relationship("Product", back_populates="variants")
    inventory_movements = relationship("InventoryMovement", back_populates="variant")

class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(Integer, primary_key=True, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)  # Positif pour restock, négatif pour vente
    reason = Column(SQLEnum(InventoryReason), nullable=False)
    order_id = Column(Integer, nullable=True)
    reference = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    variant = relationship("ProductVariant", back_populates="inventory_movements")
