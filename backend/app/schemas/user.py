import re
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.enums import UserRole

MOROCCAN_PHONE_REGEX = re.compile(r"^(\+212|0)(5|6|7)\d{8}$")

def _validate_moroccan_phone(v: Optional[str]) -> Optional[str]:
    if v is None or v == "":
        return v
    cleaned = re.sub(r"[\s\-\.]", "", str(v).strip())
    if not MOROCCAN_PHONE_REGEX.match(cleaned):
        raise ValueError("Numéro de téléphone marocain invalide (ex: +212612345678 ou 0612345678)")
    return cleaned

class AddressBase(BaseModel):
    full_name: str
    phone: str
    street_address: str
    city: str
    region: Optional[str] = None
    postal_code: Optional[str] = None
    delivery_instructions: Optional[str] = None
    is_default: bool = False

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v: str) -> str:
        res = _validate_moroccan_phone(v)
        if not res:
            raise ValueError("Le numéro de téléphone est requis")
        return res

class AddressCreate(AddressBase):
    pass

class AddressResponse(AddressBase):
    id: int
    user_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v: Optional[str]) -> Optional[str]:
        return _validate_moroccan_phone(v)

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v: Optional[str]) -> Optional[str]:
        return _validate_moroccan_phone(v)

class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    avatar_url: Optional[str] = None
    oauth_provider: Optional[str] = None
    created_at: datetime
    addresses: List[AddressResponse] = []

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[UserRole] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class OAuthCallbackRequest(BaseModel):
    provider: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    oauth_id: Optional[str] = None
