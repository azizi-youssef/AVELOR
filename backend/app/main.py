from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1.api import api_router
from app.db.seed import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Démarrage : Tentative de synchronisation des tables et seed
    try:
        Base.metadata.create_all(bind=engine)
        try:
            seed_database()
        except Exception as seed_err:
            print(f"[AVELOR BACKEND] Info seed: {seed_err}")
    except Exception as db_err:
        print(f"[AVELOR BACKEND] Avertissement connexion DB : {db_err}")
        print("[AVELOR BACKEND] L'API FastAPI démarre en mode résilient. Assurez-vous de renseigner le mot de passe Supabase dans backend/.env")
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

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
