from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.config import settings
from app.core.database import Base, engine
from app.core.limiter import limiter
from app.api.v1.api import api_router
from app.db.seed import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Démarrage : Création des tables et initialisation des données si nécessaire
    try:
        Base.metadata.create_all(bind=engine)
        try:
            seed_database()
        except Exception as e:
            print(f"Erreur d'initialisation seed: {e}")
    except Exception as e:
        print(f"[AVELOR DB WARNING] Connexion impossible a la base de donnees au demarrage: {e}")
        print("[AVELOR DB INFO] Verifiez votre DATABASE_URL dans backend/.env (mot de passe Supabase ou PostgreSQL local).")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="API REST professionnelle pour la boutique de mode luxueuse AVELOR (Maroc) - Homme & Femme",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
)

# Enregistrement des routes API
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": "1.0.0",
        "currency": settings.CURRENCY,
        "status": "operational",
        "docs_url": f"{settings.API_V1_STR}/docs"
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}
