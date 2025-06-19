# Vida Coach

[![CI](https://github.com/my-org/vida-coach/actions/workflows/test.yml/badge.svg)](https://github.com/my-org/vida-coach/actions/workflows/test.yml)
[![Coverage Status](https://codecov.io/gh/my-org/vida-coach/branch/main/graph/badge.svg)](https://codecov.io/gh/my-org/vida-coach)

Vida Coach is an AI-powered life improvement platform built with FastAPI and Next.js. This repository contains both the backend API and the Next.js frontend.

## Project Setup

1. Clone the repository and install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Copy `.env.example` to `.env` and fill in the required environment variables.
3. Ensure PostgreSQL (or SQLite for local dev) is running and accessible via `DATABASE_URL`.
4. (Optional) Build and run with Docker:
   ```bash
   docker build -t vida-coach .
   docker run -p 8000:8000 vida-coach
   ```

## Running the Backend

```bash
uvicorn main:app --reload
```

OpenAPI documentation is available at `http://localhost:8000/docs` when running locally.

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

## Running Tests

Backend tests:
```bash
pytest -q
```

Frontend unit tests:
```bash
cd frontend
npm run test:unit
```

## Makefile Commands

The repository includes a simple Makefile for common tasks:

```bash
make dev   # run backend and frontend together
make test  # run backend tests
make build # build Docker image
make lint  # run black and flake8
```

## Additional Docs

- [Agent Architecture](AGENTS.md)
- [Full Documentation](docs/README.md)
- [Changelog](changelog.md)

See [docs/agent.md](docs/agent.md) for detailed agent pipelines.
