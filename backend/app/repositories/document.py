import uuid
from typing import List, Optional
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.models import Document, DocumentChunk, ProcessingStatus
from app.repositories.base import BaseRepository

class DocumentRepository(BaseRepository[Document]):
    def __init__(self):
        super().__init__(Document)

    async def get_by_workspace(
        self, db: AsyncSession, workspace_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> List[Document]:
        stmt = select(Document).where(
            Document.workspace_id == workspace_id,
            Document.deleted_at.is_(None)
        ).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_workspace_count(self, db: AsyncSession, workspace_id: uuid.UUID) -> int:
        stmt = select(func.count()).where(
            Document.workspace_id == workspace_id,
            Document.deleted_at.is_(None)
        )
        result = await db.execute(stmt)
        return result.scalar_one()

    async def soft_delete(self, db: AsyncSession, id: uuid.UUID) -> Optional[Document]:
        document = await self.get(db, id)
        if document:
            document.delete()
            db.add(document)
            await db.flush()
        return document

    async def update_status(
        self, db: AsyncSession, id: uuid.UUID, status: ProcessingStatus, error: Optional[str] = None
    ) -> Optional[Document]:
        document = await self.get(db, id)
        if document:
            document.processing_status = status
            if error is not None:
                document.error_message = error
            db.add(document)
            await db.flush()
        return document

class DocumentChunkRepository(BaseRepository[DocumentChunk]):
    def __init__(self):
        super().__init__(DocumentChunk)

    async def get_by_document(self, db: AsyncSession, document_id: uuid.UUID) -> List[DocumentChunk]:
        stmt = select(DocumentChunk).where(DocumentChunk.document_id == document_id).order_by(DocumentChunk.chunk_index)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def delete_by_document(self, db: AsyncSession, document_id: uuid.UUID) -> None:
        chunks = await self.get_by_document(db, document_id)
        for chunk in chunks:
            await db.delete(chunk)
        await db.flush()

document_repo = DocumentRepository()
document_chunk_repo = DocumentChunkRepository()
