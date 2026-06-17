import uuid
from datetime import timedelta
from typing import Optional, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.database.models import User, Workspace
from app.repositories.user import user_repo
from app.repositories.workspace import workspace_repo
from app.repositories.audit import audit_repo
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from app.schemas.user import UserCreate, PasswordChange, Token

class AuthService:
    async def register_user(
        self, db: AsyncSession, *, user_in: UserCreate, ip_address: str, user_agent: str
    ) -> User:
        """Register a new user, create their profile, default preferences, and initialize a personal workspace."""
        # 1. Check duplicate
        existing_user = await user_repo.get_by_email(db, email=user_in.email)
        if existing_user:
            await audit_repo.log_audit_event(
                db,
                ip_address=ip_address,
                user_agent=user_agent,
                event_type="auth.register.duplicate",
                status="failure",
                payload={"email": user_in.email}
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )

        # 2. Hash password and save user/profile/preferences
        hashed_password = get_password_hash(user_in.password)
        user = await user_repo.create_user_with_profile(
            db,
            email=user_in.email,
            hashed_password=hashed_password,
            first_name=user_in.first_name,
            last_name=user_in.last_name
        )

        # 3. Initialize default personal workspace
        workspace_slug = "personal-workspace"
        workspace = await workspace_repo.create(
            db,
            obj_in={
                "owner_id": user.id,
                "name": "Personal Workspace",
                "slug": workspace_slug
            }
        )

        # 4. Audit logging
        await audit_repo.log_audit_event(
            db,
            user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent,
            event_type="auth.register",
            status="success",
            payload={"email": user.email, "workspace_id": str(workspace.id)}
        )
        
        await audit_repo.log_activity(
            db,
            workspace_id=workspace.id,
            user_id=user.id,
            action="create",
            entity_type="workspace",
            entity_id=workspace.id,
            metadata_json={"workspace_name": workspace.name}
        )

        return user

    async def authenticate_user(
        self, db: AsyncSession, *, email: str, password: str, ip_address: str, user_agent: str
    ) -> Token:
        """Authenticate user, verify password, and return access & refresh tokens."""
        user = await user_repo.get_by_email(db, email=email)
        if not user or not verify_password(password, user.hashed_password):
            await audit_repo.log_audit_event(
                db,
                ip_address=ip_address,
                user_agent=user_agent,
                event_type="auth.login",
                status="failure",
                payload={"email": email}
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            await audit_repo.log_audit_event(
                db,
                user_id=user.id,
                ip_address=ip_address,
                user_agent=user_agent,
                event_type="auth.login.inactive",
                status="failure",
                payload={"email": email}
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user account."
            )

        # Generate tokens
        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)

        # Audit login event
        await audit_repo.log_audit_event(
            db,
            user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent,
            event_type="auth.login",
            status="success",
            payload={"email": email}
        )

        return Token(access_token=access_token, refresh_token=refresh_token)

    async def refresh_tokens(
        self, db: AsyncSession, *, refresh_token: str, ip_address: str, user_agent: str
    ) -> Token:
        """Validate refresh token and issue new access & refresh tokens."""
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token."
            )

        user_id_str = payload.get("sub")
        if not user_id_str:
            raise HTTPException(
                status_code=status.HTTP_412_PRECONDITION_FAILED,
                detail="Subject claim missing in token."
            )

        user_id = uuid.UUID(user_id_str)
        user = await user_repo.get(db, id=user_id)
        if not user or not user.is_active or user.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive or deleted."
            )

        # Issue rotated tokens
        new_access_token = create_access_token(subject=user.id)
        new_refresh_token = create_refresh_token(subject=user.id)

        await audit_repo.log_audit_event(
            db,
            user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent,
            event_type="auth.token.refresh",
            status="success"
        )

        return Token(access_token=new_access_token, refresh_token=new_refresh_token)

    async def change_password(
        self, db: AsyncSession, *, user: User, password_in: PasswordChange, ip_address: str, user_agent: str
    ) -> None:
        """Change user password after verifying current password."""
        if not verify_password(password_in.current_password, user.hashed_password):
            await audit_repo.log_audit_event(
                db,
                user_id=user.id,
                ip_address=ip_address,
                user_agent=user_agent,
                event_type="auth.password.change",
                status="failure",
                payload={"reason": "Incorrect current password"}
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password."
            )

        user.hashed_password = get_password_hash(password_in.new_password)
        db.add(user)
        await db.flush()

        await audit_repo.log_audit_event(
            db,
            user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent,
            event_type="auth.password.change",
            status="success"
        )

auth_service = AuthService()
