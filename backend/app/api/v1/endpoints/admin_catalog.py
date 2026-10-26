"""
Endpoint administration — Gestion du catalogue produits (CRUD + stock + images).
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import List, Optional

from app.core.database import get_db
from app.api.deps import get_catalog_manager
from app.models.user import User
from app.models.product import Product, ProductVariant, ProductImage, InventoryMovement
from app.models.enums import InventoryReason, GenderUniverse
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse,
    ProductVariantResponse,
)
from app.services.audit_service import AuditService

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
#  PRODUITS
# ─────────────────────────────────────────────────────────────────────────────
@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    prod_in: ProductCreate,
    req: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_catalog_manager)
):
    existing = db.query(Product).filter(
        or_(Product.sku == prod_in.sku, Product.slug == prod_in.slug)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Un produit avec ce SKU ou Slug existe déjà")

    product = Product(
        sku=prod_in.sku,
        slug=prod_in.slug,
        name_fr=prod_in.name_fr,
        name_ar=prod_in.name_ar,
        short_desc_fr=prod_in.short_desc_fr,
        short_desc_ar=prod_in.short_desc_ar,
        description_fr=prod_in.description_fr,
        description_ar=prod_in.description_ar,
        base_price=prod_in.base_price,
        discount_price=prod_in.discount_price,
        universe=prod_in.universe,
        category_id=prod_in.category_id,
        is_active=prod_in.is_active,
        is_featured=prod_in.is_featured,
        is_new=prod_in.is_new,
        tags=prod_in.tags,
        material_fr=prod_in.material_fr,
        material_ar=prod_in.material_ar,
    )
    db.add(product)
    db.flush()

    for v in prod_in.variants:
        variant = ProductVariant(
            product_id=product.id,
            sku=v.sku,
            size=v.size,
            color_name_fr=v.color_name_fr,
            color_name_ar=v.color_name_ar,
            color_code=v.color_code,
            stock=v.stock,
            is_active=v.is_active
        )
        db.add(variant)

    for idx, img in enumerate(prod_in.images):
        p_img = ProductImage(
            product_id=product.id,
            url=img.url,
            alt_text_fr=img.alt_text_fr or prod_in.name_fr,
            alt_text_ar=img.alt_text_ar or prod_in.name_ar,
            is_cover=img.is_cover or (idx == 0),
            sort_order=img.sort_order or idx
        )
        db.add(p_img)

    AuditService.log(
        db=db, action="CREATE_PRODUCT", entity="Product",
        entity_id=str(product.id), user_id=user.id,
        details=f"Création produit {product.name_fr} ({product.sku})"
    )
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    prod_update: ProductUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_catalog_manager)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")

    update_data = prod_update.model_dump(exclude_unset=True)
    images_data = update_data.pop("images", None)
    variants_data = update_data.pop("variants", None)

    for field, val in update_data.items():
        setattr(product, field, val)

    if images_data is not None:
        db.query(ProductImage).filter(ProductImage.product_id == product.id).delete()
        for idx, img in enumerate(images_data):
            p_img = ProductImage(
                product_id=product.id,
                url=img["url"],
                alt_text_fr=img.get("alt_text_fr") or product.name_fr,
                alt_text_ar=img.get("alt_text_ar") or product.name_ar,
                is_cover=img.get("is_cover", False) or (idx == 0),
                sort_order=img.get("sort_order", idx)
            )
            db.add(p_img)

    if variants_data is not None:
        existing_variants = {v.sku: v for v in product.variants}
        for v in variants_data:
            sku = v["sku"]
            if sku in existing_variants:
                ev = existing_variants[sku]
                ev.size = v["size"]
                ev.color_name_fr = v["color_name_fr"]
                ev.color_name_ar = v["color_name_ar"]
                ev.color_code = v["color_code"]
                ev.stock = v.get("stock", 0)
                ev.is_active = v.get("is_active", True)
            else:
                nv = ProductVariant(
                    product_id=product.id,
                    sku=sku,
                    size=v["size"],
                    color_name_fr=v["color_name_fr"],
                    color_name_ar=v["color_name_ar"],
                    color_code=v["color_code"],
                    stock=v.get("stock", 0),
                    is_active=v.get("is_active", True)
                )
                db.add(nv)

    AuditService.log(
        db=db, action="UPDATE_PRODUCT", entity="Product",
        entity_id=str(product.id), user_id=user.id,
        details=f"Mise à jour produit {product.name_fr}"
    )
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_catalog_manager)
):
    """
    Soft-delete : marque le produit comme supprimé (deleted_at) et le désactive
    sans effacer les données — l'historique des commandes reste intact.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")

    product.is_active = False
    product.deleted_at = datetime.now(timezone.utc).replace(tzinfo=None)

    AuditService.log(
        db=db, action="ARCHIVE_PRODUCT", entity="Product",
        entity_id=str(product.id), user_id=user.id,
        details=f"Désactivation (soft-delete) du produit {product.name_fr}"
    )
    db.commit()
    return {"message": "Produit archivé avec succès", "deleted_at": product.deleted_at}


# ─────────────────────────────────────────────────────────────────────────────
#  STOCK / VARIANTES
# ─────────────────────────────────────────────────────────────────────────────
@router.put("/variants/{variant_id}/stock")
def update_variant_stock(
    variant_id: int,
    data: dict,
    db: Session = Depends(get_db),
    user: User = Depends(get_catalog_manager)
):
    variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Variante non trouvée")

    new_stock = data.get("stock")
    if new_stock is None or int(new_stock) < 0:
        raise HTTPException(status_code=400, detail="Stock invalide")

    diff = int(new_stock) - variant.stock
    variant.stock = int(new_stock)

    inv = InventoryMovement(
        variant_id=variant.id,
        quantity=diff,
        reason=InventoryReason.ADJUSTMENT,
        reference=f"admin_{user.id}"
    )
    db.add(inv)
    db.commit()
    db.refresh(variant)
    return {"message": "Stock mis à jour", "stock": variant.stock, "variant_id": variant.id}


# ─────────────────────────────────────────────────────────────────────────────
#  INVENTAIRE
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/inventory")
def get_admin_inventory(
    low_stock_only: bool = False,
    universe: Optional[GenderUniverse] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    user: User = Depends(get_catalog_manager)
):
    query = db.query(ProductVariant).options(
        joinedload(ProductVariant.product).joinedload(Product.category)
    ).join(Product, ProductVariant.product_id == Product.id)

    if low_stock_only:
        query = query.filter(ProductVariant.stock < 5)
    if universe:
        query = query.filter(Product.universe == universe)
    if search:
        st = f"%{search.strip()}%"
        query = query.filter(
            or_(
                ProductVariant.sku.ilike(st),
                Product.name_fr.ilike(st),
                Product.name_ar.ilike(st),
                ProductVariant.size.ilike(st),
                ProductVariant.color_name_fr.ilike(st)
            )
        )

    total = query.count()
    variants = query.order_by(ProductVariant.stock.asc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [
            {
                "id": v.id,
                "product_id": v.product_id,
                "product_name": v.product.name_fr if v.product else "",
                "product_sku": v.product.sku if v.product else "",
                "sku": v.sku,
                "size": v.size,
                "color_name": v.color_name_fr,
                "color_code": v.color_code,
                "stock": v.stock,
                "base_price": float(v.product.base_price) if v.product else 0.0,
                "discount_price": float(v.product.discount_price) if (v.product and v.product.discount_price) else None,
                "universe": v.product.universe if v.product else "UNISEX",
                "category_name": v.product.category.name_fr if (v.product and v.product.category) else "Général",
                "is_active": v.is_active and (v.product.is_active if v.product else True),
                "status": "OUT_OF_STOCK" if v.stock == 0 else ("LOW_STOCK" if v.stock < 5 else "IN_STOCK")
            } for v in variants
        ]
    }


@router.get("/inventory/movements")
def get_inventory_movements(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_catalog_manager)
):
    query = db.query(InventoryMovement).options(
        joinedload(InventoryMovement.variant).joinedload(ProductVariant.product)
    ).order_by(InventoryMovement.created_at.desc())

    total = query.count()
    movements = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [
            {
                "id": m.id,
                "variant_id": m.variant_id,
                "sku": m.variant.sku if m.variant else "Inconnu",
                "product_name": m.variant.product.name_fr if (m.variant and m.variant.product) else "",
                "quantity": m.quantity,
                "reason": m.reason,
                "order_id": m.order_id,
                "reference": m.reference,
                "created_at": m.created_at
            } for m in movements
        ]
    }
