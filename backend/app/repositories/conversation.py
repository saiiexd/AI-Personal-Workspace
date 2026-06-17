import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.models import AIConversation, AIConversationMessage, MessageRole
from app.repositories.base import BaseRepository

class ConversationRepository(BaseRepository[AIConversation]):
    def __init__(self):
        super().__init__(AIConversation)

    async def get_by_workspace(
        self, db: AsyncSession, workspace_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> List[AIConversation]:
        """Fetch conversations in a workspace (excluding soft deleted)."""
        stmt = select(AIConversation).where(
            AIConversation.workspace_id == workspace_id,
            AIConversation.deleted_at.is_(None)
        ).order_by(AIConversation.updated_at.desc()).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def create_conversation(self, db: AsyncSession, *, workspace_id: uuid.UUID, title: str) -> AIConversation:
        """Create a new AI conversation thread."""
        conv = AIConversation(workspace_id=workspace_id, title=title)
        db.add(conv)
        await db.flush()
        return conv

    async def add_message(
        self,
        db: AsyncSession,
        *,
        conversation_id: uuid.UUID,
        role: MessageRole,
        content: str,
        context_sources: Optional[Dict[str, Any]] = None,
        token_count: Optional[int] = None,
        model_used: Optional[str] = None
    ) -> AIConversationMessage:
        """Append a message to a conversation thread, updating the thread's updated_at timestamp."""
        # 1. Create message
        msg = AIConversationMessage(
            conversation_id=conversation_id,
            role=role,
            content=content,
            context_sources=context_sources,
            token_count=token_count,
            model_used=model_used
        )
        db.add(msg)

        # 2. Update parent conversation timestamp
        conv = await self.get(db, conversation_id)
        if conv:
            db.add(conv)  # Triggers updated_at automatically via TimestampMixin rules
            
        await db.flush()
        return msg

    async def get_messages(self, db: AsyncSession, conversation_id: uuid.UUID) -> List[AIConversationMessage]:
        """Fetch all messages inside a conversation thread in chronological order."""
        stmt = select(AIConversationMessage).where(
            AIConversationMessage.conversation_id == conversation_id
        ).order_by(AIConversationMessage.created_at.asc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def soft_delete(self, db: AsyncSession, id: uuid.UUID) -> Optional[AIConversation]:
        """Soft delete a conversation thread."""
        conv = await self.get(db, id)
        if conv:
            conv.delete()
            db.add(conv)
            await db.flush()
        return conv

conversation_repo = ConversationRepository()
