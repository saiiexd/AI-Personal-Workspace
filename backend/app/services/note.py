import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.database.models import Note, NoteVersion
from app.repositories.note import note_repo
from app.repositories.audit import audit_repo
from app.schemas.note import NoteCreate, NoteUpdate

class NoteService:
    async def create_note(
        self, db: AsyncSession, *, workspace_id: uuid.UUID, user_id: uuid.UUID, note_in: NoteCreate
    ) -> Note:
        """Create a new note, insert initial version, and log creation audit logs."""
        note = await note_repo.create_note(
            db,
            workspace_id=workspace_id,
            title=note_in.title,
            content=note_in.content,
            user_id=user_id
        )

        # Trigger AI indexing / search embedding hook (asynchronously)
        await self._trigger_ai_indexing(note.id, note.title, note.content)

        await audit_repo.log_activity(
            db,
            workspace_id=workspace_id,
            user_id=user_id,
            action="create",
            entity_type="note",
            entity_id=note.id,
            metadata_json={"title": note.title}
        )

        return note

    async def update_note(
        self, db: AsyncSession, *, note_id: uuid.UUID, user_id: uuid.UUID, note_in: NoteUpdate
    ) -> Note:
        """Update a note, incrementing the version snapshot and trigger AI indexing hook."""
        note = await note_repo.get(db, id=note_id)
        if not note or note.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found."
            )

        title = note_in.title if note_in.title is not None else note.title
        content = note_in.content if note_in.content is not None else note.content

        updated_note = await note_repo.update_note(
            db,
            note_id=note_id,
            title=title,
            content=content,
            user_id=user_id
        )

        # Trigger AI indexing / search embedding update hook
        await self._trigger_ai_indexing(updated_note.id, updated_note.title, updated_note.content)

        await audit_repo.log_activity(
            db,
            workspace_id=updated_note.workspace_id,
            user_id=user_id,
            action="update",
            entity_type="note",
            entity_id=updated_note.id,
            metadata_json={"version": updated_note.version}
        )

        return updated_note

    async def rollback_note(
        self, db: AsyncSession, *, note_id: uuid.UUID, user_id: uuid.UUID, version_num: int
    ) -> Note:
        """Rollback note to a historical version snapshot."""
        note = await note_repo.rollback_to_version(
            db, note_id=note_id, version_num=version_num, user_id=user_id
        )
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note or historical snapshot version not found."
            )

        await self._trigger_ai_indexing(note.id, note.title, note.content)

        await audit_repo.log_activity(
            db,
            workspace_id=note.workspace_id,
            user_id=user_id,
            action="rollback",
            entity_type="note",
            entity_id=note.id,
            metadata_json={"rolled_back_to_version": version_num, "new_version": note.version}
        )
        return note

    async def soft_delete_note(
        self, db: AsyncSession, *, note_id: uuid.UUID, user_id: uuid.UUID
    ) -> Note:
        """Soft delete a note."""
        note = await note_repo.get(db, id=note_id)
        if not note or note.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found."
            )

        deleted_note = await note_repo.soft_delete(db, id=note_id)

        await audit_repo.log_activity(
            db,
            workspace_id=note.workspace_id,
            user_id=user_id,
            action="soft_delete",
            entity_type="note",
            entity_id=note_id
        )
        return deleted_note

    async def restore_note(
        self, db: AsyncSession, *, note_id: uuid.UUID, user_id: uuid.UUID
    ) -> Note:
        """Restore a soft-deleted note."""
        note = await note_repo.get(db, id=note_id)
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found."
            )

        if note.deleted_at is None:
            return note

        note.restore()
        db.add(note)
        await db.flush()

        await self._trigger_ai_indexing(note.id, note.title, note.content)

        await audit_repo.log_activity(
            db,
            workspace_id=note.workspace_id,
            user_id=user_id,
            action="restore",
            entity_type="note",
            entity_id=note_id
        )
        return note

    async def _trigger_ai_indexing(self, note_id: uuid.UUID, title: str, content: str) -> None:
        """
        AI Indexing Hook.
        Registers hooks for semantic indexing and vector embeddings triggers.
        """
        # In a fully-integrated environment, this dispatches a Celery task or a background thread
        # to generate embeddings and index chunks.
        pass

note_service = NoteService()
