.PHONY: dev build down logs migrate format lint

dev:
	docker-compose up -d

build:
	docker-compose build

down:
	docker-compose down

logs:
	docker-compose logs -f

migrate:
	docker-compose exec api alembic upgrade head

format:
	cd backend && ruff format .
	cd frontend && npm run format

lint:
	cd backend && ruff check .
	cd frontend && npm run lint
