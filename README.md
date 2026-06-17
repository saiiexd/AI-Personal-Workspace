# AI Personal Workspace

Welcome to **AI Personal Workspace**, an AI-powered personal productivity operating system. This platform seamlessly integrates Notes, Tasks, Documents, and an AI semantic search engine, giving you a comprehensive, intelligent system for managing your knowledge and daily workflows.

## Features

- **Notes & Knowledge Base**: Rich-text notes with Markdown support.
- **Task Management**: Organize, schedule, and track tasks alongside your notes.
- **Document Intelligence**: Upload documents and interact with them.
- **AI Semantic Search**: Powered by RAG (Retrieval-Augmented Generation) and OpenAI, instantly find and query information across all your notes, tasks, and documents using natural language.
- **Secure Authentication**: Robust local authentication and workspace scoping.

## Tech Stack

This project is built using a modern, scalable polyglot monorepo architecture:

- **Frontend**: [Next.js 15 (App Router)](https://nextjs.org/), TypeScript, Tailwind CSS, shadcn/ui.
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/), Python 3.12, Celery.
- **Database**: PostgreSQL 16 with `pgvector` for semantic embeddings, managed via SQLAlchemy 2.0 & Alembic.
- **Cache & Broker**: Redis.
- **AI Engine**: OpenAI embeddings & language models.
- **Infrastructure**: Docker Compose, Terraform (AWS ready).

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- Git
- An OpenAI API Key (for AI semantic search features)

## Getting Started

Follow these steps to launch the entire full-stack application on your local machine.

### 1. Clone the repository

```bash
git clone https://github.com/saiiexd/AI-Personal-Workspace.git
cd AI-Personal-Workspace
```

### 2. Configure Environment Variables

Create your `.env` files for both the backend and frontend using the provided templates:

```bash
# Setup backend variables
cp backend/.env.example backend/.env

# Setup frontend variables
cp frontend/.env.example frontend/.env.local
```

**CRITICAL STEP**: Open `backend/.env` and replace `your_openai_api_key_here` with your actual OpenAI API Key. The AI retrieval pipelines require this to function.

### 3. Start the Application

### 3. Start the Application

Run the unified startup command. This single command will check if Docker is running, spin up all containers (Database, Redis, API, Worker, and Frontend), wait for the database, and automatically run migrations:

```bash
python run.py
# (or run: make start)
```

The services will be available at:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)


## Repository Structure

```text
ai-personal-workspace/
├── frontend/             # Next.js 15 React application
├── backend/              # FastAPI application (includes AI logic & background workers)
├── infrastructure/       # Terraform AWS IaC
├── scripts/              # Validation and release-candidate tools
├── docker-compose.yml    # Local development orchestration
└── Makefile              # Developer shortcuts
```

## Production Deployment

This project is fully ready for production deployment using the provided Terraform configurations.

- **AWS Infrastructure**: See `terraform/` for VPC, RDS Postgres, and ECS configurations.
- **CI/CD**: GitHub Actions workflows are included in `.github/workflows/` for automated testing, linting, Docker builds, and deployments.

## License

MIT
