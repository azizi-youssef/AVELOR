from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models.category import Category
from app.models.enums import GenderUniverse
from app.schemas.category import CategoryResponse

router = APIRouter()

@router.get("", response_model=List[CategoryResponse])
def get_categories(
    universe: Optional[GenderUniverse] = Query(None, description="Filtrer par univers"),
    include_all: bool = Query(False, description="Inclure catégories unisexes en plus de l'univers"),
    db: Session = Depends(get_db)
):
    query = db.query(Category).filter(Category.is_active == True)
    
    if universe:
        if include_all:
            query = query.filter(Category.universe.in_([universe, GenderUniverse.UNISEX]))
        else:
            query = query.filter(Category.universe == universe)

    return query.order_by(Category.sort_order.asc(), Category.name_fr.asc()).all()

@router.get("/{slug}", response_model=CategoryResponse)
def get_category_by_slug(slug: str, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.slug == slug, Category.is_active == True).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catégorie non trouvée")
    return category
