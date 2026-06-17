import pytest
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user import user_repo
from app.repositories.workspace import workspace_repo
from app.repositories.note import note_repo
from app.repositories.document import document_repo
from app.repositories.task import task_repo
from app.repositories.conversation import conversation_repo
from app.repositories.audit import audit_repo
from app.database.models import TaskStatus, TaskPriority, MessageRole
from app.database.validators import ValidationError

@pytest.mark.asyncio
async def test_user_creation_and_preferences(db_session: AsyncSession):
    # Test valid user creation
    user = await user_repo.create_user_with_profile(
        db_session,
        email="test@example.com",
        hashed_password="hashed_pw_123",
        first_name="Alice",
        last_name="Smith"
    )
    assert user.id is not None
    assert user.email == "test@example.com"
    
    # Test email validator
    with pytest.raises(ValidationError):
        await user_repo.create_user_with_profile(
            db_session,
            email="invalidemail",
            hashed_password="pw"
        )

    # Fetch preferences
    prefs = await user_repo.get_preferences(db_session, user.id)
    assert prefs is not None
    assert prefs.theme == "light"

    # Update preferences
    updated_prefs = await user_repo.update_preferences(db_session, user.id, {"theme": "dark", "notifications_enabled": False})
    assert updated_prefs.theme == "dark"

@pytest.mark.asyncio
async def test_workspace_and_slugs(db_session: AsyncSession):
    user = await user_repo.create_user_with_profile(
        db_session, email="owner@example.com", hashed_password="pw"
    )
    
    # Create workspace
    workspace = await workspace_repo.create(
        db_session,
        obj_in={
            "owner_id": user.id,
            "name": "My AI Space",
            "slug": "my-ai-space"
        }
    )
    assert workspace.id is not None
    assert workspace.slug == "my-ai-space"

    # Slug validation test
    with pytest.raises(ValidationError):
        await workspace_repo.create(
            db_session,
            obj_in={
                "owner_id": user.id,
                "name": "Invalid Space",
                "slug": "Invalid Slug!"
            }
        )

@pytest.mark.asyncio
async def test_notes_and_version_control(db_session: AsyncSession):
    user = await user_repo.create_user_with_profile(
        db_session, email="note_user@example.com", hashed_password="pw"
    )
    workspace = await workspace_repo.create(
        db_session, obj_in={"owner_id": user.id, "name": "Notes space", "slug": "notes-space"}
    )

    # Create note
    note = await note_repo.create_note(
        db_session,
        workspace_id=workspace.id,
        title="Draft Note",
        content="Initial text content.",
        user_id=user.id
    )
    assert note.version == 1
    
    # Update note
    updated_note = await note_repo.update_note(
        db_session,
        note_id=note.id,
        title="First Update",
        content="Modified content.",
        user_id=user.id
    )
    assert updated_note.version == 2

    # Get history
    history = await note_repo.get_version_history(db_session, note.id)
    assert len(history) == 2
    assert history[0].version_num == 2
    assert history[1].version_num == 1

    # Rollback note
    rolled_back = await note_repo.rollback_to_version(db_session, note.id, 1, user_id=user.id)
    assert rolled_back.content == "Initial text content."
    assert rolled_back.version == 3

@pytest.mark.asyncio
async def test_document_embedding_search(db_session: AsyncSession):
    user = await user_repo.create_user_with_profile(
        db_session, email="doc_user@example.com", hashed_password="pw"
    )
    workspace = await workspace_repo.create(
        db_session, obj_in={"owner_id": user.id, "name": "Docs space", "slug": "docs-space"}
    )

    # Create a vector representing the query & chunks
    vec_a = [0.1] * 1536
    vec_b = [0.9] * 1536

    chunks = [
        {"chunk_index": 0, "content": "Database scaling details.", "embedding": vec_a},
        {"chunk_index": 1, "content": "RAG architecture design.", "embedding": vec_b}
    ]

    doc = await document_repo.create_document_with_chunks(
        db_session,
        workspace_id=workspace.id,
        title="Architecture doc",
        file_type="pdf",
        s3_path="s3://bucket/doc.pdf",
        size_bytes=1024,
        chunks_data=chunks
    )
    assert doc.id is not None

    # Search for vectors similar to vec_a
    results = await document_repo.vector_similarity_search(
        db_session,
        workspace_id=workspace.id,
        query_embedding=vec_a,
        limit=1
    )
    assert len(results) == 1
    assert results[0].content == "Database scaling details."

@pytest.mark.asyncio
async def test_tasks_and_filters(db_session: AsyncSession):
    user = await user_repo.create_user_with_profile(
        db_session, email="task_user@example.com", hashed_password="pw"
    )
    workspace = await workspace_repo.create(
        db_session, obj_in={"owner_id": user.id, "name": "Tasks space", "slug": "tasks-space"}
    )

    cat = await task_repo.create_category(
        db_session, workspace_id=workspace.id, name="Work", color="#FF5733"
    )
    
    # Task Category Hex validation test
    with pytest.raises(ValidationError):
        await task_repo.create_category(
            db_session, workspace_id=workspace.id, name="Home", color="invalid_hex"
        )

    task = await task_repo.create(
        db_session,
        obj_in={
            "workspace_id": workspace.id,
            "title": "Fix memory leaks",
            "status": TaskStatus.TODO,
            "priority": TaskPriority.URGENT,
            "category_id": cat.id
        }
    )
    assert task.id is not None

    # Filter task
    tasks = await task_repo.get_by_workspace(
        db_session, workspace_id=workspace.id, status=TaskStatus.TODO
    )
    assert len(tasks) == 1
    assert tasks[0].priority == TaskPriority.URGENT
