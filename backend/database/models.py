# Expose all models from app/database/models for compatibility with backend package
from app.database.models import (
    Base,
    ProcessingStatus,
    TaskStatus,
    TaskPriority,
    MessageRole,
    User,
    UserProfile,
    UserPreferences,
    Workspace,
    TaskCategory,
    Note,
    NoteVersion,
    Document,
    DocumentChunk,
    Task,
    AIConversation,
    AIConversationMessage,
    ActivityLog,
    AuditEvent,
    Notification
)
