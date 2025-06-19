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
