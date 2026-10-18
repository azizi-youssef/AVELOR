from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    categories,
    products,
    orders,
    promotions,
    campaigns,
    admin
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentification & Profil"])
api_router.include_router(categories.router, prefix="/categories", tags=["Catégories"])
api_router.include_router(products.router, prefix="/products", tags=["Catalogue Produits"])
api_router.include_router(orders.router, prefix="/orders", tags=["Commandes & Checkout"])
api_router.include_router(promotions.router, prefix="/promotions", tags=["Promotions & Codes Promo"])
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["Campagnes & Bannières"])
api_router.include_router(admin.router, prefix="/admin", tags=["Espace Administration"])
