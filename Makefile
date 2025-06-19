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
