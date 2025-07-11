# Vida Coach Developer Onboarding

## Folder Structure

- `agents/` - domain-specific AI agents and the base agent class.
- `auth/` - JWT authentication utilities and dependencies.
- `config/` - application settings and feature flag definitions.
- `database/` - SQLAlchemy base, migrations, and session helpers.
- `docs/` - internal architecture and planning documents.
- `frontend/` - Next.js 14 web client (Tailwind + ShadCN).
- `models/` - ORM models shared across services and routes.
- `orchestration/` - the agent execution engine and plugin loader.
- `routes/` - FastAPI route handlers grouped by feature.
- `services/` - business logic used by routes and jobs.
- `tests/` - pytest suites and factories for generating mock data.
- `utils/` - helper functions like logging and serialization.

## Bootstrapping Locally

1. **Environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your API keys and database connection string.

2. **Docker (recommended)**
   ```bash
   docker build -t vida-coach .
   docker run -p 8000:8000 --env-file .env vida-coach
   ```
   This runs the backend with `uvicorn` and installs dependencies automatically.

3. **Makefile helpers**
   Common tasks are wrapped in a `Makefile`.
   ```bash
   make install   # install Python and Node packages
   make run       # start FastAPI with reload
   make test      # run backend pytest suite
   ```

4. **Mock data**
   The test suite and some admin routes use static mock data located in
   `services/webhook_event_service.py` and the `factories/` folder. Use these as
   references when generating seed data for local development.

## Frontend

From the `frontend/` directory run `npm run dev` to start the Next.js
application. Ensure you ran `make install` or `npm install` first.

---
_Last updated: 2025-06_
