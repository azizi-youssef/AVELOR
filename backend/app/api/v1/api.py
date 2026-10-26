from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    categories,
    products,
    orders,
    promotions,
    campaigns,
    admin,
    admin_dashboard,
    admin_catalog,
    admin_orders,
    admin_misc,
)

api_router = APIRouter()

# Routes publiques
api_router.include_router(auth.router, prefix="/auth", tags=["Authentification & Profil"])
api_router.include_router(categories.router, prefix="/categories", tags=["Catégories"])
api_router.include_router(products.router, prefix="/products", tags=["Catalogue Produits"])
api_router.include_router(orders.router, prefix="/orders", tags=["Commandes & Checkout"])
api_router.include_router(promotions.router, prefix="/promotions", tags=["Promotions & Codes Promo"])
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["Campagnes & Bannières"])

# ─── Administration (modules découpés) ──────────────────────────────────────
# Dashboard stats
api_router.include_router(
    admin_dashboard.router, prefix="/admin/dashboard",
    tags=["Admin — Dashboard"]
)
# Catalogue produits + inventaire (routes /admin/products/** et /admin/inventory/**)
api_router.include_router(
    admin_catalog.router, prefix="/admin/products",
    tags=["Admin — Catalogue"]
)
api_router.include_router(
    admin_catalog.router, prefix="/admin",
    tags=["Admin — Inventaire"],
    include_in_schema=False  # évite doublon dans docs
)
# Commandes admin
api_router.include_router(
    admin_orders.router, prefix="/admin/orders",
    tags=["Admin — Commandes"]
)
# Divers : campagnes, promos, clients, audit, paramètres
api_router.include_router(
    admin_misc.router, prefix="/admin",
    tags=["Admin — Divers"]
)

# Ancien routeur monolithique (maintenu pour compatibilité avec le frontend existant)
api_router.include_router(admin.router, prefix="/admin", tags=["Espace Administration"])
