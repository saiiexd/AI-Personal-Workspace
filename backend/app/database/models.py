import uuid
import enum
from datetime import datetime
from typing import List, Optional, Dict, Any

from sqlalchemy import String, Text, ForeignKey, Integer, JSON, Boolean, Index, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from pgvector.sqlalchemy import Vector

from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, OptimisticVersionMixin

# Enums
class ProcessingStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class TaskStatus(str, enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"

class TaskPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class MessageRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

# Models

class User(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    profile: Mapped[Optional["UserProfile"]] = relationship(back_populates="user", cascade="all, delete-orphan", uselist=False, lazy="selectin")
    preferences: Mapped[Optional["UserPreferences"]] = relationship(back_populates="user", cascade="all, delete-orphan", uselist=False, lazy="selectin")
    workspaces: Mapped[List["Workspace"]] = relationship(back_populates="owner", cascade="all, delete-orphan")
    activity_logs: Mapped[List["ActivityLog"]] = relationship(back_populates="user")
    audit_events: Mapped[List["AuditEvent"]] = relationship(back_populates="user")
    notifications: Mapped[List["Notification"]] = relationship(back_populates="user", cascade="all, delete-orphan")

    @validates("email")
    def validate_user_email(self, key, address):
        from app.database.validators import validate_email
        return validate_email(address)


class UserProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "user_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    first_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="profile")


class UserPreferences(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "user_preferences"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    theme: Mapped[str] = mapped_column(String(20), default="light", nullable=False)
    notifications_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    settings_json: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="preferences")


class Workspace(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "workspaces"

    owner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), index=True, nullable=False)

    # Relationships
    owner: Mapped["User"] = relationship(back_populates="workspaces")
    notes: Mapped[List["Note"]] = relationship(back_populates="workspace", cascade="all, delete-orphan")
    documents: Mapped[List["Document"]] = relationship(back_populates="workspace", cascade="all, delete-orphan")
    tasks: Mapped[List["Task"]] = relationship(back_populates="workspace", cascade="all, delete-orphan")
    ai_conversations: Mapped[List["AIConversation"]] = relationship(back_populates="workspace", cascade="all, delete-orphan")
    task_categories: Mapped[List["TaskCategory"]] = relationship(back_populates="workspace", cascade="all, delete-orphan")
    activity_logs: Mapped[List["ActivityLog"]] = relationship(back_populates="workspace")

    __table_args__ = (
        Index("idx_workspace_owner_slug", "owner_id", "slug", unique=True),
    )

    @validates("slug")
    def validate_workspace_slug(self, key, slug_value):
        from app.database.validators import validate_slug
        return validate_slug(slug_value)


class TaskCategory(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "task_categories"

    workspace_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("workspaces.id", ondelete="CASCADE"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    color: Mapped[str] = mapped_column(String(7), default="#000000", nullable=False) # Hex color

    # Relationships
    workspace: Mapped["Workspace"] = relationship(back_populates="task_categories")
    tasks: Mapped[List["Task"]] = relationship(back_populates="category")

    __table_args__ = (
        Index("idx_workspace_category_name", "workspace_id", "name", unique=True),
    )

    @validates("color")
    def validate_category_color(self, key, color_value):
        from app.database.validators import validate_hex_color
        return validate_hex_color(color_value)


class Note(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, OptimisticVersionMixin):
    __tablename__ = "notes"

    workspace_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("workspaces.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), default="Untitled Note", nullable=False)
    content: Mapped[str] = mapped_column(Text, default="", nullable=False)

    # Relationships
    workspace: Mapped["Workspace"] = relationship(back_populates="notes")
    versions: Mapped[List["NoteVersion"]] = relationship(back_populates="note", cascade="all, delete-orphan")
    tasks: Mapped[List["Task"]] = relationship(back_populates="source_note")


class NoteVersion(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "note_versions"

    note_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("notes.id", ondelete="CASCADE"), index=True, nullable=False)
    version_num: Mapped[int] = mapped_column(Integer, nullable=False)
    title_snapshot: Mapped[str] = mapped_column(String(255), nullable=False)
    content_snapshot: Mapped[str] = mapped_column(Text, nullable=False)
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    note: Mapped["Note"] = relationship(back_populates="versions")

    __table_args__ = (
        Index("idx_note_version_num", "note_id", "version_num", unique=True),
    )


class Document(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "documents"

    workspace_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("workspaces.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    s3_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    processing_status: Mapped[ProcessingStatus] = mapped_column(
        String(50),
        default=ProcessingStatus.PENDING,
        nullable=False
    )
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    workspace: Mapped["Workspace"] = relationship(back_populates="documents")
    chunks: Mapped[List["DocumentChunk"]] = relationship(back_populates="document", cascade="all, delete-orphan")
    tasks: Mapped[List["Task"]] = relationship(back_populates="source_document")


class DocumentChunk(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "document_chunks"

    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), index=True, nullable=False)
    workspace_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("workspaces.id", ondelete="CASCADE"), index=True, nullable=False)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding = mapped_column(Vector(1536), nullable=False)

    # Relationships
    document: Mapped["Document"] = relationship(back_populates="chunks")

    __table_args__ = (
        Index("idx_doc_chunk_index", "document_id", "chunk_index", unique=True),
    )


class Task(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, OptimisticVersionMixin):
    __tablename__ = "tasks"

    workspace_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("workspaces.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    status: Mapped[TaskStatus] = mapped_column(String(50), default=TaskStatus.TODO, nullable=False)
    priority: Mapped[TaskPriority] = mapped_column(String(50), default=TaskPriority.MEDIUM, nullable=False)
    due_date: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("task_categories.id", ondelete="SET NULL"), index=True, nullable=True)
    source_note_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("notes.id", ondelete="SET NULL"), index=True, nullable=True)
    source_document_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("documents.id", ondelete="SET NULL"), index=True, nullable=True)

    # Relationships
    workspace: Mapped["Workspace"] = relationship(back_populates="tasks")
    category: Mapped[Optional["TaskCategory"]] = relationship(back_populates="tasks")
    source_note: Mapped[Optional["Note"]] = relationship(back_populates="tasks")
    source_document: Mapped[Optional["Document"]] = relationship(back_populates="tasks")


class AIConversation(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "ai_conversations"

    workspace_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("workspaces.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), default="New Conversation", nullable=False)

    # Relationships
    workspace: Mapped["Workspace"] = relationship(back_populates="ai_conversations")
    messages: Mapped[List["AIConversationMessage"]] = relationship(back_populates="conversation", cascade="all, delete-orphan")


class AIConversationMessage(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "ai_conversation_messages"

    conversation_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ai_conversations.id", ondelete="CASCADE"), index=True, nullable=False)
    role: Mapped[MessageRole] = mapped_column(String(50), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    context_sources: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    token_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    model_used: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Relationships
    conversation: Mapped["AIConversation"] = relationship(back_populates="messages")


class ActivityLog(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "activity_logs"

    workspace_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("workspaces.id", ondelete="SET NULL"), index=True, nullable=True)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True, nullable=False)
    metadata_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    # Relationships
    user: Mapped[Optional["User"]] = relationship(back_populates="activity_logs")
    workspace: Mapped[Optional["Workspace"]] = relationship(back_populates="activity_logs")


class AuditEvent(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "audit_events"

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False) # Max IPv6 length is 45 chars
    user_agent: Mapped[str] = mapped_column(String(512), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. "auth.login"
    status: Mapped[str] = mapped_column(String(20), nullable=False) # "success" or "failure"
    payload: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    # Relationships
    user: Mapped[Optional["User"]] = relationship(back_populates="audit_events")


class Notification(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "notifications"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(String(50), default="info", nullable=False) # e.g. info, warning, alert
    read_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="notifications")
