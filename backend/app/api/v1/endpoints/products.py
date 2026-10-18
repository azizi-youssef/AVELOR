from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, desc, asc
from typing import Optional, List
from decimal import Decimal

from app.core.database import get_db
from app.models.product import Product, ProductVariant
from app.models.category import Category
from app.models.enums import GenderUniverse
from app.schemas.product import ProductResponse, ProductListResponse

router = APIRouter()

@router.get("", response_model=ProductListResponse)
def get_products(
    universe: Optional[GenderUniverse] = Query(None, description="Univers (MEN, WOMEN, UNISEX)"),
    category_slug: Optional[str] = Query(None, description="Slug de la catégorie"),
    category_id: Optional[int] = Query(None, description="ID de la catégorie"),
    min_price: Optional[Decimal] = Query(None, description="Prix minimum en MAD"),
    max_price: Optional[Decimal] = Query(None, description="Prix maximum en MAD"),
    size: Optional[str] = Query(None, description="Taille (S, M, L, 42, etc.)"),
    color: Optional[str] = Query(None, description="Nom ou code couleur"),
    is_new: Optional[bool] = Query(None, description="Nouveautés"),
    is_featured: Optional[bool] = Query(None, description="Produits en vedette"),
    search: Optional[str] = Query(None, description="Recherche textuelle fr/ar"),
    sort: Optional[str] = Query("newest", description="Tri: newest, price_asc, price_desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(Product.is_active == True)

    # Filtre par univers (Si MEN demandé, inclure MEN et UNISEX)
    if universe:
        query = query.filter(Product.universe.in_([universe, GenderUniverse.UNISEX]))

    # Filtre par catégorie
    if category_slug:
        query = query.join(Product.category).filter(Category.slug == category_slug)
    elif category_id:
        query = query.filter(Product.category_id == category_id)

    # Filtre par prix (en prenant en compte les éventuels discount_price)
    if min_price is not None:
        query = query.filter(
            or_(
                and_(Product.discount_price.isnot(None), Product.discount_price >= min_price),
                and_(Product.discount_price.is_(None), Product.base_price >= min_price)
            )
        )
    if max_price is not None:
        query = query.filter(
            or_(
                and_(Product.discount_price.isnot(None), Product.discount_price <= max_price),
                and_(Product.discount_price.is_(None), Product.base_price <= max_price)
            )
        )

    # Filtres par taille ou couleur au niveau des variantes
    if size or color:
        query = query.join(Product.variants).filter(ProductVariant.is_active == True)
        if size:
            query = query.filter(ProductVariant.size == size)
        if color:
            query = query.filter(
                or_(
                    ProductVariant.color_name_fr.ilike(f"%{color}%"),
                    ProductVariant.color_name_ar.ilike(f"%{color}%"),
                    ProductVariant.color_code.ilike(f"%{color}%")
                )
            )

    # Filtre nouveautés / vedettes
    if is_new is not None:
        query = query.filter(Product.is_new == is_new)
    if is_featured is not None:
        query = query.filter(Product.is_featured == is_featured)

    # Recherche
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Product.name_fr.ilike(search_term),
                Product.name_ar.ilike(search_term),
                Product.description_fr.ilike(search_term),
                Product.description_ar.ilike(search_term),
                Product.sku.ilike(search_term)
            )
        )

    # Tri
    if sort == "price_asc":
        query = query.order_by(asc(Product.base_price))
    elif sort == "price_desc":
        query = query.order_by(desc(Product.base_price))
    else:  # newest par défaut
        query = query.order_by(desc(Product.created_at))

    total = query.distinct().count()
    total_pages = (total + page_size - 1) // page_size

    items = query.distinct().options(
        joinedload(Product.category),
        joinedload(Product.images),
        joinedload(Product.variants)
    ).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/{slug}", response_model=ProductResponse)
def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    product = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.images),
        joinedload(Product.variants)
    ).filter(Product.slug == slug, Product.is_active == True).first()

    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produit non trouvé")
    return product

@router.get("/{slug}/similar", response_model=List[ProductResponse])
def get_similar_products(slug: str, limit: int = 4, db: Session = Depends(get_db)):
    current_product = db.query(Product).filter(Product.slug == slug).first()
    if not current_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produit non trouvé")

    similar = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.images),
        joinedload(Product.variants)
    ).filter(
        Product.id != current_product.id,
        Product.category_id == current_product.category_id,
        Product.is_active == True
    ).limit(limit).all()

    return similar
