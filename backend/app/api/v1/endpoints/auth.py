from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.database.models import User
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserProfileUpdate,
    UserPreferencesResponse,
    Token,
    PasswordChange
)
from app.services.auth import auth_service
from app.repositories.user import user_repo

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: Request,
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Register a new user account with default profile, preferences, and personal workspace."""
    ip_address = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    
    user = await auth_service.register_user(
        db, user_in=user_in, ip_address=ip_address, user_agent=user_agent
    )
    return user

@router.post("/login", response_model=Token)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """OAuth2 compatible token login, retrieve access and refresh tokens."""
    ip_address = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    
    token = await auth_service.authenticate_user(
        db,
        email=form_data.username,
        password=form_data.password,
        ip_address=ip_address,
        user_agent=user_agent
    )
    return token

@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: Request,
    refresh_token: str,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Refresh JWT access token by validating refresh token."""
    ip_address = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    
    token = await auth_service.refresh_tokens(
        db, refresh_token=refresh_token, ip_address=ip_address, user_agent=user_agent
    )
    return token

@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user)
) -> Any:
    """Retrieve details of the currently authenticated user."""
    return current_user

@router.put("/me/profile", response_model=UserResponse)
async def update_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Update profile information of the currently authenticated user."""
    if current_user.profile:
        # Update existing profile
        for field, value in profile_in.model_dump(exclude_unset=True).items():
            setattr(current_user.profile, field, value)
        db.add(current_user.profile)
        await db.flush()
    return current_user

@router.put("/me/preferences", response_model=UserPreferencesResponse)
async def update_preferences(
    settings_dict: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Update preferences of the currently authenticated user."""
    updated_prefs = await user_repo.update_preferences(db, current_user.id, settings_dict)
    if not updated_prefs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User preferences not found."
        )
    return updated_prefs

@router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    request: Request,
    password_in: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Change user password after verifying current password."""
    ip_address = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    
    await auth_service.change_password(
        db,
        user=current_user,
        password_in=password_in,
        ip_address=ip_address,
        user_agent=user_agent
    )
    return {"message": "Password updated successfully."}
