 codex/add-makefile-commands
.PHONY: dev test build lint

# run full stack in development mode
# uses script to start backend and frontend concurrently

dev:
	bash scripts/dev.sh

# run backend tests

test:
	pytest -q

# build Docker image

build:
	docker build -t vida-coach .

# format and lint python code

lint:
	black . && flake8 .
=======
.PHONY: install run test docker-build docker-run

install:
	pip install -r requirements.txt
	cd frontend && npm install

run:
	uvicorn main:app --reload

docker-build:
	docker build -t vida-coach .

docker-run:
	docker run -p 8000:8000 --env-file .env vida-coach

test:
	pytest -q
 main
