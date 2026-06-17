.PHONY: start dev build down logs migrate format lint

start:
	python run.py

dev:
	python run.py


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
