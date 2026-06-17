from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.database.models import User
from app.schemas.user import UserResponse, UserProfileUpdate

router = APIRouter()

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
        for field, value in profile_in.model_dump(exclude_unset=True).items():
            setattr(current_user.profile, field, value)
        db.add(current_user.profile)
        await db.flush()
        await db.commit()
        await db.refresh(current_user)
    return current_user
