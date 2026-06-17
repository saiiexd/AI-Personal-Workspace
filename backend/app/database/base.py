import uuid
import time
import os
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP

def uuidv7() -> uuid.UUID:
    """Generate a UUIDv7 (time-ordered UUID)."""
    timestamp_ms = int(time.time() * 1000)
    timestamp_hex = f"{timestamp_ms:012x}"
    rand_bytes = os.urandom(10)
    rand_hex = rand_bytes.hex()
    
    part1 = timestamp_hex[:8]
    part2 = timestamp_hex[8:]
    part3 = "7" + rand_hex[:3]
    # Variant bits: 10xx (8, 9, a, or b in hex)
    var_bit = hex((int(rand_hex[3], 16) & 0x3) | 0x8)[2:]
    part4 = var_bit + rand_hex[4:7]
    part5 = rand_hex[7:19]
    
    return uuid.UUID(f"{part1}-{part2}-{part3}-{part4}-{part5}")

def utcnow() -> datetime:
    return datetime.now(timezone.utc)

class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass

class UUIDPrimaryKeyMixin:
    """Mixin to add a UUIDv7 primary key to a model."""
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuidv7,
        index=True
    )

class TimestampMixin:
    """Mixin to add created_at and updated_at columns."""
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        default=utcnow,
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        default=utcnow,
        onupdate=utcnow,
        nullable=False
    )

class SoftDeleteMixin:
    """Mixin to add soft deletion capability."""
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True,
        default=None
    )

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None

    def delete(self, deleted_by: Optional[uuid.UUID] = None) -> None:
        self.deleted_at = utcnow()

    def restore(self) -> None:
        self.deleted_at = None

class OptimisticVersionMixin:
    """Mixin for optimistic concurrency control."""
    version: Mapped[int] = mapped_column(
        default=1,
        nullable=False,
        onupdate=lambda ctx: ctx.current_parameters.get("version", 1) + 1
    )
