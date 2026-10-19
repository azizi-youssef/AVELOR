from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import or_

from app.core.database import get_db
from app.models.campaign import Campaign
from app.models.enums import GenderUniverse
from app.schemas.campaign import CampaignResponse

router = APIRouter()

@router.get("/active", response_model=List[CampaignResponse])
def get_active_campaigns(
    universe: Optional[GenderUniverse] = Query(None, description="Filtrer par univers"),
    db: Session = Depends(get_db)
):
    now = datetime.now(timezone.utc)
    query = db.query(Campaign).filter(
        Campaign.is_active == True,
        or_(Campaign.starts_at.is_(None), Campaign.starts_at <= now),
        or_(Campaign.expires_at.is_(None), Campaign.expires_at >= now)
    )

    if universe:
        query = query.filter(Campaign.target_universe.in_([universe, GenderUniverse.UNISEX]))

    return query.order_by(Campaign.sort_order.asc()).all()
