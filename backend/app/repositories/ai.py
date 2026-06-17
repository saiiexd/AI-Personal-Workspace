import uuid
from typing import List, Optional
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.models import AIConversation, AIConversationMessage
from app.repositories.base import BaseRepository

class AIConversationRepository(BaseRepository[AIConversation]):
    def __init__(self):
        super().__init__(AIConversation)

    async def get_by_workspace(
        self, db: AsyncSession, workspace_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> List[AIConversation]:
        stmt = select(AIConversation).where(
            AIConversation.workspace_id == workspace_id,
            AIConversation.deleted_at.is_(None)
        ).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_workspace_count(self, db: AsyncSession, workspace_id: uuid.UUID) -> int:
        stmt = select(func.count()).where(
            AIConversation.workspace_id == workspace_id,
            AIConversation.deleted_at.is_(None)
        )
        result = await db.execute(stmt)
        return result.scalar_one()

    async def soft_delete(self, db: AsyncSession, id: uuid.UUID) -> Optional[AIConversation]:
        conversation = await self.get(db, id)
        if conversation:
            conversation.delete()
            db.add(conversation)
            await db.flush()
        return conversation

class AIConversationMessageRepository(BaseRepository[AIConversationMessage]):
    def __init__(self):
        super().__init__(AIConversationMessage)

    async def get_by_conversation(self, db: AsyncSession, conversation_id: uuid.UUID) -> List[AIConversationMessage]:
        stmt = select(AIConversationMessage).where(
            AIConversationMessage.conversation_id == conversation_id
        ).order_by(AIConversationMessage.created_at)
        result = await db.execute(stmt)
        return list(result.scalars().all())

ai_conversation_repo = AIConversationRepository()
ai_message_repo = AIConversationMessageRepository()
