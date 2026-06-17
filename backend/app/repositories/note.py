import uuid
from typing import List, Optional, Tuple
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.models import Note, NoteVersion
from app.repositories.base import BaseRepository

class NoteRepository(BaseRepository[Note]):
    def __init__(self):
        super().__init__(Note)

    async def get_by_workspace(
        self, db: AsyncSession, workspace_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> List[Note]:
        """Fetch active notes for a given workspace."""
        stmt = select(Note).where(
            Note.workspace_id == workspace_id,
            Note.deleted_at.is_(None)
        ).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def create_note(
        self, db: AsyncSession, *, workspace_id: uuid.UUID, title: str, content: str, user_id: Optional[uuid.UUID] = None
    ) -> Note:
        """Create a note and store its initial version (Version 1)."""
        note = Note(
            workspace_id=workspace_id,
            title=title,
            content=content,
            version=1
        )
        db.add(note)
        await db.flush()

        version = NoteVersion(
            note_id=note.id,
            version_num=1,
            title_snapshot=title,
            content_snapshot=content,
            created_by=user_id
        )
        db.add(version)
        await db.flush()

        return note

    async def update_note(
        self, db: AsyncSession, *, note_id: uuid.UUID, title: str, content: str, user_id: Optional[uuid.UUID] = None
    ) -> Optional[Note]:
        """Update a note and create a new historical snapshot in note_versions."""
        note = await self.get(db, note_id)
        if not note or note.deleted_at is not None:
            return None

        # Increment version using optimistic concurrency logic
        next_version = note.version + 1
        note.title = title
        note.content = content
        note.version = next_version
        
        db.add(note)

        # Write version history snapshot
        version = NoteVersion(
            note_id=note.id,
            version_num=next_version,
            title_snapshot=title,
            content_snapshot=content,
            created_by=user_id
        )
        db.add(version)
        await db.flush()

        return note

    async def get_version_history(self, db: AsyncSession, note_id: uuid.UUID) -> List[NoteVersion]:
        """Get version history list for a note."""
        stmt = select(NoteVersion).where(NoteVersion.note_id == note_id).order_by(NoteVersion.version_num.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def rollback_to_version(
        self, db: AsyncSession, note_id: uuid.UUID, version_num: int, user_id: Optional[uuid.UUID] = None
    ) -> Optional[Note]:
        """Rollback a note to a specific version number."""
        note = await self.get(db, note_id)
        if not note or note.deleted_at is not None:
            return None

        # Fetch specified snapshot
        stmt = select(NoteVersion).where(
            NoteVersion.note_id == note_id,
            NoteVersion.version_num == version_num
        )
        result = await db.execute(stmt)
        snapshot = result.scalars().first()
        if not snapshot:
            return None

        # Update note to matching snapshot and append history version
        return await self.update_note(
            db,
            note_id=note_id,
            title=snapshot.title_snapshot,
            content=snapshot.content_snapshot,
            user_id=user_id
        )

    async def soft_delete(self, db: AsyncSession, id: uuid.UUID) -> Optional[Note]:
        """Soft delete a note."""
        note = await self.get(db, id)
        if note:
            note.delete()
            db.add(note)
            await db.flush()
        return note

    async def search_notes(
        self, db: AsyncSession, workspace_id: uuid.UUID, query: str, skip: int = 0, limit: int = 100
    ) -> List[Note]:
        """Keyword search notes inside a workspace."""
        from sqlalchemy import or_
        stmt = select(Note).where(
            Note.workspace_id == workspace_id,
            Note.deleted_at.is_(None),
            or_(
                Note.title.ilike(f"%{query}%"),
                Note.content.ilike(f"%{query}%")
            )
        ).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

note_repo = NoteRepository()
