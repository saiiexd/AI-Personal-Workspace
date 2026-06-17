import uuid
import logging
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.models import Document, DocumentChunk, ProcessingStatus
from app.repositories.document import document_repo, document_chunk_repo
from app.services.storage import storage_service

logger = logging.getLogger(__name__)

class DocumentProcessingService:
    async def process_document(self, db: AsyncSession, document_id: uuid.UUID) -> None:
        """Process a document: extract text, chunk, and embed."""
        # 1. Update status to PROCESSING
        document = await document_repo.update_status(db, id=document_id, status=ProcessingStatus.PROCESSING)
        await db.commit()
        await db.refresh(document)
        
        if not document:
            return

        try:
            # 2. Get file content
            file_content = await storage_service.get_file(document.s3_path)
            if not file_content:
                raise Exception("File not found in storage")

            # 3. Extract text (mock extraction for now)
            text = self._extract_text(file_content, document.file_type)

            # 4. Chunk text
            chunks = self._chunk_text(text)

            # 5. Embed chunks and save
            await document_chunk_repo.delete_by_document(db, document.id)
            
            for i, chunk_text in enumerate(chunks):
                # Mock embedding generation (1536 dims of 0.0)
                embedding = [0.0] * 1536
                
                chunk = DocumentChunk(
                    document_id=document.id,
                    workspace_id=document.workspace_id,
                    chunk_index=i,
                    content=chunk_text,
                    embedding=embedding
                )
                db.add(chunk)
                
            # 6. Update status to COMPLETED
            document.processing_status = ProcessingStatus.COMPLETED
            await db.commit()
        except Exception as e:
            logger.error(f"Error processing document {document_id}: {e}")
            await db.rollback()
            await document_repo.update_status(db, id=document_id, status=ProcessingStatus.FAILED, error=str(e))
            await db.commit()

    def _extract_text(self, file_content: bytes, file_type: str) -> str:
        """Extract text from file content based on file type."""
        # This is a stub for actual extraction logic (PyMuPDF, etc.)
        if file_type == "text/plain":
            return file_content.decode("utf-8")
        return "Mock extracted text for file type: " + file_type

    def _chunk_text(self, text: str, chunk_size: int = 1000) -> List[str]:
        """Split text into chunks."""
        # This is a stub for an actual chunking algorithm (RecursiveCharacterTextSplitter, etc.)
        return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

document_processing_service = DocumentProcessingService()
