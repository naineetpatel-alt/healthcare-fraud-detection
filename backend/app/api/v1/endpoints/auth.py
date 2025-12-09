"""
Authentication endpoints for user registration, login, and token management.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.db.sqlite_db import get_db
from app.models.auth_models import User, RefreshToken
from app.schemas.auth_schemas import (
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse,
    TokenRefresh,
    TokenRevoke,
    MessageResponse
)
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.dependencies import get_current_user
from app.config import settings


router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user account.

    Args:
        user_data: User registration data
        db: Database session

    Returns:
        Created user information

    Raises:
        HTTPException: If username or email already exists
    """
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Check if email already exists
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        is_active=True,
        is_superuser=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=TokenResponse)
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and return access and refresh tokens.

    Args:
        login_data: User login credentials
        db: Database session

    Returns:
        JWT access and refresh tokens

    Raises:
        HTTPException: If credentials are invalid
    """
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )

    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})

    # Create refresh token
    refresh_token_str = create_refresh_token(data={"sub": str(user.id)})

    # Store refresh token in database
    refresh_token_expires = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    refresh_token_obj = RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=refresh_token_expires,
        revoked=False
    )

    db.add(refresh_token_obj)
    db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_str,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_access_token(refresh_data: TokenRefresh, db: Session = Depends(get_db)):
    """
    Refresh an access token using a refresh token.

    Args:
        refresh_data: Refresh token
        db: Database session

    Returns:
        New access token and refresh token

    Raises:
        HTTPException: If refresh token is invalid or revoked
    """
    # Decode refresh token
    payload = decode_token(refresh_data.refresh_token)

    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token payload"
        )

    # Check if refresh token exists and is not revoked
    refresh_token = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_data.refresh_token,
        RefreshToken.user_id == int(user_id),
        RefreshToken.revoked == False
    ).first()

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found or revoked"
        )

    # Check if refresh token is expired
    if refresh_token.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired"
        )

    # Create new access token
    access_token = create_access_token(data={"sub": user_id})

    # Create new refresh token and revoke old one
    new_refresh_token_str = create_refresh_token(data={"sub": user_id})
    refresh_token_expires = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)

    # Revoke old refresh token
    refresh_token.revoked = True

    # Create new refresh token
    new_refresh_token_obj = RefreshToken(
        user_id=int(user_id),
        token=new_refresh_token_str,
        expires_at=refresh_token_expires,
        revoked=False
    )

    db.add(new_refresh_token_obj)
    db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token_str,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60
    )


@router.post("/logout", response_model=MessageResponse)
def logout_user(logout_data: TokenRevoke, db: Session = Depends(get_db)):
    """
    Logout user by revoking their refresh token.

    Args:
        logout_data: Refresh token to revoke
        db: Database session

    Returns:
        Success message

    Raises:
        HTTPException: If refresh token not found
    """
    # Find and revoke refresh token
    refresh_token = db.query(RefreshToken).filter(
        RefreshToken.token == logout_data.refresh_token
    ).first()

    if refresh_token:
        refresh_token.revoked = True
        db.commit()

    return MessageResponse(message="Successfully logged out")


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information.

    Args:
        current_user: Current authenticated user from dependency

    Returns:
        Current user information
    """
    return current_user
