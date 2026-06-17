import os
import aiofiles
from typing import Optional

class StorageService:
    def __init__(self):
        self.upload_dir = os.environ.get("STORAGE_UPLOAD_DIR", "/tmp/ai_workspace_uploads")
        os.makedirs(self.upload_dir, exist_ok=True)

    async def upload_file(self, file_content: bytes, filename: str, path_prefix: str) -> str:
        """Upload a file to storage and return the path."""
        s3_path = f"{path_prefix}/{filename}"
        local_path = os.path.join(self.upload_dir, s3_path)
        
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        
        async with aiofiles.open(local_path, "wb") as f:
            await f.write(file_content)
            
        return s3_path

    async def get_file(self, s3_path: str) -> Optional[bytes]:
        """Retrieve a file from storage."""
        local_path = os.path.join(self.upload_dir, s3_path)
        if not os.path.exists(local_path):
            return None
            
        async with aiofiles.open(local_path, "rb") as f:
            return await f.read()

    async def delete_file(self, s3_path: str) -> bool:
        """Delete a file from storage."""
        local_path = os.path.join(self.upload_dir, s3_path)
        if os.path.exists(local_path):
            os.remove(local_path)
            return True
        return False

storage_service = StorageService()
