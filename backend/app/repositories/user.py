import uuid
from typing import Optional, Dict, Any, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.models import User, UserProfile, UserPreferences
from app.repositories.base import BaseRepository

class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        """Retrieve a user by email, ignoring soft deleted users."""
        stmt = select(User).where(User.email == email, User.deleted_at.is_(None))
        result = await db.execute(stmt)
        return result.scalars().first()

    async def create_user_with_profile(
        self,
        db: AsyncSession,
        *,
        email: str,
        hashed_password: str,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        theme: str = "light"
    ) -> User:
        """Create a complete User with their Profile and default Preferences in a transaction."""
        user = User(email=email, hashed_password=hashed_password)
        db.add(user)
        await db.flush()  # Populate user.id

        profile = UserProfile(
            user_id=user.id,
            first_name=first_name,
            last_name=last_name
        )
        db.add(profile)

        preferences = UserPreferences(
            user_id=user.id,
            theme=theme,
            notifications_enabled=True,
            settings_json={}
        )
        db.add(preferences)
        await db.flush()
        
        return user

    async def get_preferences(self, db: AsyncSession, user_id: uuid.UUID) -> Optional[UserPreferences]:
        """Fetch user preferences."""
        stmt = select(UserPreferences).where(UserPreferences.user_id == user_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def update_preferences(
        self, db: AsyncSession, user_id: uuid.UUID, settings_dict: Dict[str, Any]
    ) -> Optional[UserPreferences]:
        """Update user preferences."""
        prefs = await self.get_preferences(db, user_id)
        if prefs:
            prefs.settings_json = {**prefs.settings_json, **settings_dict}
            db.add(prefs)
            await db.flush()
        return prefs

    async def soft_delete(self, db: AsyncSession, id: uuid.UUID) -> Optional[User]:
        """Soft delete a user."""
        user = await self.get(db, id)
        if user:
            user.delete()
            db.add(user)
            await db.flush()
        return user

user_repo = UserRepository()
