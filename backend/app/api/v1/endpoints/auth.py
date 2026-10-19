from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
import jwt as pyjwt

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.core.limiter import limiter
from app.api.deps import get_current_user
from app.models.user import User, Address
from app.models.enums import UserRole
from app.schemas.user import (
    UserCreate, UserResponse, UserUpdate,
    AddressCreate, AddressResponse, Token, LoginRequest, OAuthCallbackRequest
)

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register(request: Request, user_in: UserCreate, db: Session = Depends(get_db)):
    # Vérifier l'unicité de l'email
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un compte existe déjà avec cette adresse email"
        )
    
    user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        phone=user_in.phone,
        role=UserRole.CUSTOMER,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(request: Request, login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce compte utilisateur est désactivé"
        )

    token = create_access_token(subject=user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login-form", response_model=Token)
@limiter.limit("5/minute")
def login_form(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username.lower()).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants invalides"
        )
    token = create_access_token(subject=user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_update.first_name is not None:
        current_user.first_name = user_update.first_name
    if user_update.last_name is not None:
        current_user.last_name = user_update.last_name
    if user_update.phone is not None:
        current_user.phone = user_update.phone
    if user_update.password:
        current_user.hashed_password = get_password_hash(user_update.password)

    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/me/addresses", response_model=List[AddressResponse])
def get_user_addresses(current_user: User = Depends(get_current_user)):
    return current_user.addresses

@router.post("/me/addresses", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
def add_address(
    address_in: AddressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if address_in.is_default:
        for addr in current_user.addresses:
            addr.is_default = False

    new_address = Address(
        user_id=current_user.id,
        **address_in.model_dump()
    )
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address

@router.post("/oauth-callback", response_model=Token)
def oauth_callback(
    data: OAuthCallbackRequest,
    db: Session = Depends(get_db)
):
    """
    Connexion ou inscription via un fournisseur OAuth (Google, Supabase, etc.)
    Retrouve l'utilisateur par son email ou crée un nouveau compte avec les métadonnées fournies.
    """
    clean_email = data.email.lower().strip()
    user = db.query(User).filter(User.email == clean_email).first()

    if user:
        if data.avatar_url and not user.avatar_url:
            user.avatar_url = data.avatar_url
        if data.provider and not user.oauth_provider:
            user.oauth_provider = data.provider
        if data.oauth_id and not user.oauth_id:
            user.oauth_id = data.oauth_id
        if data.first_name and not user.first_name:
            user.first_name = data.first_name
        if data.last_name and not user.last_name:
            user.last_name = data.last_name
        user.is_active = True
        db.commit()
        db.refresh(user)
    else:
        user = User(
            email=clean_email,
            first_name=data.first_name or "",
            last_name=data.last_name or "",
            avatar_url=data.avatar_url,
            oauth_provider=data.provider,
            oauth_id=data.oauth_id,
            role=UserRole.CUSTOMER,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(subject=user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }
