import uuid
import asyncio
from typing import List, Optional, Tuple
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Document, Workspace, ProcessingStatus
from app.repositories.document import document_repo
from app.repositories.workspace import workspace_repo
from app.schemas.document import DocumentUpdate
from app.services.storage import storage_service
from app.services.document_processing import document_processing_service

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME_TYPES = {
    "text/plain": ".txt",
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "text/markdown": ".md"
}

class DocumentService:
    async def get_workspace(self, db: AsyncSession, workspace_id: uuid.UUID, user_id: uuid.UUID) -> Workspace:
        workspace = await workspace_repo.get(db, workspace_id)
        if not workspace:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
        # In a real app we'd verify user is a member of the workspace.
        return workspace

    async def upload_document(
        self, db: AsyncSession, *, workspace_id: uuid.UUID, user_id: uuid.UUID, file: UploadFile, title: Optional[str] = None
    ) -> Document:
        await self.get_workspace(db, workspace_id, user_id)
        
        # 1. Validation
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file type")
            
        file_content = await file.read()
        size_bytes = len(file_content)
        
        if size_bytes > MAX_FILE_SIZE:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large")
            
        # 2. Upload to Storage
        file_title = title or file.filename or "Untitled Document"
        ext = ALLOWED_MIME_TYPES[file.content_type]
        unique_filename = f"{uuid.uuid4()}{ext}"
        s3_path = await storage_service.upload_file(file_content, unique_filename, f"workspaces/{workspace_id}/documents")
        
        # 3. Create Database Record
        doc_in = {
            "workspace_id": workspace_id,
            "title": file_title,
            "file_type": file.content_type,
            "s3_path": s3_path,
            "size_bytes": size_bytes,
            "processing_status": ProcessingStatus.PENDING
        }
        document = await document_repo.create(db, obj_in=doc_in)
        await db.commit()
        await db.refresh(document)
        
        # 4. Trigger Processing (Background)
        # Note: In a true prod app, we use Celery/arq. Here we'll fire an async task.
        asyncio.create_task(document_processing_service.process_document(db, document.id))
        
        return document

    async def get_document(self, db: AsyncSession, *, document_id: uuid.UUID, workspace_id: uuid.UUID, user_id: uuid.UUID) -> Document:
        await self.get_workspace(db, workspace_id, user_id)
        document = await document_repo.get(db, id=document_id)
        if not document or document.workspace_id != workspace_id or document.deleted_at is not None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        return document

    async def get_documents(
        self, db: AsyncSession, *, workspace_id: uuid.UUID, user_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> Tuple[List[Document], int]:
        await self.get_workspace(db, workspace_id, user_id)
        documents = await document_repo.get_by_workspace(db, workspace_id=workspace_id, skip=skip, limit=limit)
        total = await document_repo.get_by_workspace_count(db, workspace_id=workspace_id)
        return documents, total

    async def update_document(
        self, db: AsyncSession, *, document_id: uuid.UUID, workspace_id: uuid.UUID, user_id: uuid.UUID, doc_in: DocumentUpdate
    ) -> Document:
        document = await self.get_document(db, document_id=document_id, workspace_id=workspace_id, user_id=user_id)
        
        update_data = doc_in.model_dump(exclude_unset=True)
        document = await document_repo.update(db, db_obj=document, obj_in=update_data)
        await db.commit()
        await db.refresh(document)
        return document

    async def delete_document(self, db: AsyncSession, *, document_id: uuid.UUID, workspace_id: uuid.UUID, user_id: uuid.UUID) -> Document:
        document = await self.get_document(db, document_id=document_id, workspace_id=workspace_id, user_id=user_id)
        
        # Soft delete the record
        document = await document_repo.soft_delete(db, id=document_id)
        
        # In a background task, we could clean up storage
        # asyncio.create_task(storage_service.delete_file(document.s3_path))
        
        await db.commit()
        return document

document_service = DocumentService()
