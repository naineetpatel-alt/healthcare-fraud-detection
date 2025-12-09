"""
Pydantic schemas for authentication endpoints.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# Request schemas
class UserRegister(BaseModel):
    """Schema for user registration request."""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)


class UserLogin(BaseModel):
    """Schema for user login request."""
    email: EmailStr
    password: str


class TokenRefresh(BaseModel):
    """Schema for token refresh request."""
    refresh_token: str


class TokenRevoke(BaseModel):
    """Schema for token revocation (logout) request."""
    refresh_token: str


# Response schemas
class UserResponse(BaseModel):
    """Schema for user information response."""
    id: int
    username: str
    email: str
    is_active: bool
    is_superuser: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for authentication token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class MessageResponse(BaseModel):
    """Schema for simple message responses."""
    message: str
