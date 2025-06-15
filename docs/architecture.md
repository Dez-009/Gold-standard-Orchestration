# Vida Coach Backend — Phase 3 Architecture

## Tech Stack
- Python 3.11
- FastAPI
- SQLAlchemy
- PostgreSQL (or SQLite for local dev)
- Pydantic
- Pytest
- Docker (for containerization)
- Kubernetes (future deployment)
- OpenAI API (LLM integration)
- SlowAPI (Rate Limiting)
- Custom Middleware (Logging, Exception Handling, Rate Limiting)

## Core Modules
- Users
- Authentication (JWT tokens)
- Sessions
- Journal Entries
- Daily Check-ins
- Goals
- Audit Logs
- AI Coaching (LLM)
- AI Goal Suggestions (LLM + Memory)
- Reporting
- Health Checks
- Test Suite: Full regression coverage

## AI Flow
- User submits prompt
- AI Processor wraps user memory from:
    - Past coaching sessions
    - Journal entries
- System prompt + context memory injected into LLM (GPT-4o)
- Model returns coaching response or goal suggestions

## Safety Layers
- Centralized Logging
- Global Exception Handling
- Rate Limiting (Abuse Protection)
- CI-safe fully automated test suite

## Deployment Ready
- Clean modular structure
- Future microservices scalable
- Kubernetes-friendly design
- CI/CD pipelines ready
