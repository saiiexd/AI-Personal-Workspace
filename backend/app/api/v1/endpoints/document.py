import uuid
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, status

from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.database.models import User
from app.schemas.document import DocumentResponse, DocumentListResponse, DocumentUpdate
from app.services.document import document_service

router = APIRouter()

@router.post("/{workspace_id}/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    workspace_id: uuid.UUID,
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Upload a new document to the workspace."""
    return await document_service.upload_document(
        db, workspace_id=workspace_id, user_id=current_user.id, file=file, title=title
    )

@router.get("/{workspace_id}/documents", response_model=DocumentListResponse)
async def list_documents(
    workspace_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """List documents in the workspace."""
    documents, total = await document_service.get_documents(
        db, workspace_id=workspace_id, user_id=current_user.id, skip=skip, limit=limit
    )
    return DocumentListResponse(items=documents, total=total, skip=skip, limit=limit)

@router.get("/{workspace_id}/documents/{document_id}", response_model=DocumentResponse)
async def get_document(
    workspace_id: uuid.UUID,
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get a specific document."""
    return await document_service.get_document(
        db, document_id=document_id, workspace_id=workspace_id, user_id=current_user.id
    )

@router.put("/{workspace_id}/documents/{document_id}", response_model=DocumentResponse)
async def update_document(
    workspace_id: uuid.UUID,
    document_id: uuid.UUID,
    doc_in: DocumentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update a specific document."""
    return await document_service.update_document(
        db, document_id=document_id, workspace_id=workspace_id, user_id=current_user.id, doc_in=doc_in
    )

@router.delete("/{workspace_id}/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    workspace_id: uuid.UUID,
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Delete a specific document."""
    await document_service.delete_document(
        db, document_id=document_id, workspace_id=workspace_id, user_id=current_user.id
    )
