import time
from fastapi import Request, HTTPException, status
from app.core.config import settings

class RateLimiter:
    """
    In-memory rate limiter using a sliding window.
    Can be configured to use Redis in production by pointing to REDIS_URL.
    """
    def __init__(self):
        self.requests = {}

    async def check_rate_limit(self, request: Request, limit: int = 60, window_seconds: int = 60):
        # Fallback key: client IP address
        ip = request.client.host if request.client else "unknown"
        path = request.url.path
        key = f"rate:{ip}:{path}"

        now = time.time()
        # Clean expired timestamps
        if key in self.requests:
            self.requests[key] = [t for t in self.requests[key] if now - t < window_seconds]
        else:
            self.requests[key] = []

        if len(self.requests[key]) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later."
            )

        self.requests[key].append(now)

rate_limiter = RateLimiter()
