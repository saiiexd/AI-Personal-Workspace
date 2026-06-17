from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.api.workspace_deps import get_current_workspace
from app.database.models import User, Workspace, Note
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse, NoteVersionResponse
from app.services.note import note_service
from app.repositories.note import note_repo
from app.repositories.workspace import workspace_repo

router = APIRouter()

async def get_current_note(
    note_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Note:
    """FastAPI dependency to retrieve note and verify the user has access to its workspace."""
    note = await note_repo.get(db, note_id)
    if not note or note.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found."
        )
        
    # Verify workspace ownership
    is_owner = await workspace_repo.verify_ownership(db, note.workspace_id, current_user.id)
    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this note."
        )
        
    return note

@router.post("/workspaces/{workspace_id}/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_in: NoteCreate,
    workspace: Workspace = Depends(get_current_workspace),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Note:
    """Create a new note inside a workspace."""
    return await note_service.create_note(
        db, workspace_id=workspace.id, user_id=current_user.id, note_in=note_in
    )

@router.get("/workspaces/{workspace_id}/notes", response_model=List[NoteResponse])
async def list_notes(
    workspace_id: uuid.UUID,
    query: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db)
) -> List[Note]:
    """Retrieve or keyword search notes inside a workspace."""
    if query:
        return await note_repo.search_notes(
            db, workspace_id=workspace.id, query=query, skip=skip, limit=limit
        )
    return await note_repo.get_by_workspace(
        db, workspace_id=workspace.id, skip=skip, limit=limit
    )

@router.get("/notes/{note_id}", response_model=NoteResponse)
async def get_note(
    note: Note = Depends(get_current_note)
) -> Note:
    """Retrieve details of a note."""
    return note

@router.put("/notes/{note_id}", response_model=NoteResponse)
async def update_note(
    note_in: NoteUpdate,
    note: Note = Depends(get_current_note),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Note:
    """Update a note and capture a version snapshot."""
    return await note_service.update_note(
        db, note_id=note.id, user_id=current_user.id, note_in=note_in
    )

@router.delete("/notes/{note_id}", response_model=NoteResponse)
async def delete_note(
    note: Note = Depends(get_current_note),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Note:
    """Soft delete a note."""
    return await note_service.soft_delete_note(
        db, note_id=note.id, user_id=current_user.id
    )

@router.post("/notes/{note_id}/restore", response_model=NoteResponse)
async def restore_note(
    note_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Note:
    """Restore a soft-deleted note."""
    return await note_service.restore_note(
        db, note_id=note_id, user_id=current_user.id
    )

@router.get("/notes/{note_id}/versions", response_model=List[NoteVersionResponse])
async def get_note_versions(
    note: Note = Depends(get_current_note),
    db: AsyncSession = Depends(get_db)
) -> List[NoteVersionResponse]:
    """Retrieve full history snapshot list for a note."""
    return await note_repo.get_version_history(db, note_id=note.id)

@router.post("/notes/{note_id}/versions/{version_num}/rollback", response_model=NoteResponse)
async def rollback_note(
    version_num: int,
    note: Note = Depends(get_current_note),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Note:
    """Rollback a note to a specific version num."""
    return await note_service.rollback_note(
        db, note_id=note.id, user_id=current_user.id, version_num=version_num
    )
