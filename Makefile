.PHONY: install run test dev docker-build docker-run lint

# Install dependencies
install:
	pip install -r requirements.txt
	cd frontend && npm install

# Run backend with auto-reload
run:
	uvicorn main:app --reload

# Run full stack in development mode
dev:
	bash scripts/dev.sh

# Run backend tests
test:
	pytest -q

# Build Docker image
docker-build:
	docker build -t vida-coach .

# Run Docker container
docker-run:
	docker run -p 8000:8000 --env-file .env vida-coach

# Format and lint python code
lint:
	black . && flake8 .
