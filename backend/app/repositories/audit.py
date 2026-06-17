import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.models import ActivityLog, AuditEvent
from app.repositories.base import BaseRepository

class AuditRepository(BaseRepository[AuditEvent]):
    def __init__(self):
        super().__init__(AuditEvent)

    async def log_audit_event(
        self,
        db: AsyncSession,
        *,
        user_id: Optional[uuid.UUID] = None,
        ip_address: str,
        user_agent: str,
        event_type: str,
        status: str,
        payload: Optional[Dict[str, Any]] = None
    ) -> AuditEvent:
        """Log a security or authentication audit event."""
        event = AuditEvent(
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            event_type=event_type,
            status=status,
            payload=payload
        )
        db.add(event)
        await db.flush()
        return event

    async def log_activity(
        self,
        db: AsyncSession,
        *,
        workspace_id: Optional[uuid.UUID] = None,
        user_id: Optional[uuid.UUID] = None,
        action: str,
        entity_type: str,
        entity_id: uuid.UUID,
        metadata_json: Optional[Dict[str, Any]] = None
    ) -> ActivityLog:
        """Log a user activity within the workspace."""
        log = ActivityLog(
            workspace_id=workspace_id,
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            metadata_json=metadata_json
        )
        db.add(log)
        await db.flush()
        return log

    async def get_workspace_activities(
        self, db: AsyncSession, workspace_id: uuid.UUID, limit: int = 50
    ) -> List[ActivityLog]:
        """Fetch audit log activity trail for a workspace."""
        stmt = select(ActivityLog).where(
            ActivityLog.workspace_id == workspace_id
        ).order_by(ActivityLog.created_at.desc()).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

audit_repo = AuditRepository()
