import re
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHardeningMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        
        # Add secure HTTP headers
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response

def detect_prompt_injection(text: str) -> bool:
    """
    Scans incoming AI queries for prompt injection patterns.
    """
    patterns = [
        r"(?i)ignore\s+(?:previous|above|all)\s+instructions",
        r"(?i)system\s+prompt",
        r"(?i)you\s+are\s+now\s+a\s+different\s+agent",
        r"(?i)bypass\s+restrictions",
        r"(?i)reveal\s+your\s+instructions",
    ]
    for pattern in patterns:
        if re.search(pattern, text):
            return True
    return False

def validate_file_signature(content: bytes, allowed_mime: str) -> bool:
    """
    Performs basic magic number signature checks on uploaded files.
    """
    if "pdf" in allowed_mime and not content.startswith(b"%PDF"):
        return False
    return True
