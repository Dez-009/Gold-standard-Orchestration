# Vida Coach Docker Setup

## Overview
This document describes how to run the Vida Coach stack (backend and frontend) using Docker.

## Prerequisites
- Docker
- Docker Compose

## Quick Start

### Development Environment
```bash
# Start backend and frontend with hot reload
docker-compose -f docker-compose.dev.yml up --build

# Run backend tests
docker-compose -f docker-compose.dev.yml exec web pytest

# Run frontend tests
docker-compose -f docker-compose.dev.yml exec front npm test || true

# Access API documentation
open http://localhost:8000/docs
```

### Production Environment
```bash
# Start production environment
docker-compose up --build

# Run with custom environment variables
DATABASE_URL=your_db_url OPENAI_API_KEY=your_key docker-compose up --build
```

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key
- `SECRET_KEY`: Application secret key

### Optional
- `STRIPE_SECRET_KEY`: Stripe secret key (default: sk_test)
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret (default: whsec_test)
- `RATE_LIMIT`: Rate limiting (default: 100/minute)
- `TESTING`: Enable test mode (default: false)

## Services

### Web Application
- **Port**: 8000
- **Health Check**: http://localhost:8000/health/ping
- **API Docs**: http://localhost:8000/docs

### Frontend Application
- **Port**: 3000
- **Health Check**: http://localhost:3000

### PostgreSQL Database
- **Port**: 5432
- **Database**: vida_coach
- **User**: postgres
- **Password**: password

### Redis (Production)
- **Port**: 6379
- **Purpose**: Caching and session storage

## Docker Commands

### Build and Run
```bash
# Build all services
docker-compose build

# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f web
```

### Development
```bash
# Start with hot reload
docker-compose -f docker-compose.dev.yml up

# Run tests
docker-compose exec web pytest

# Access container shell
docker-compose exec web bash
```

### Database
```bash
# Access PostgreSQL
docker-compose exec db psql -U postgres -d vida_coach

# Reset database
docker-compose down -v
docker-compose up db
```

## Troubleshooting

### Port Conflicts
If ports are already in use, modify the port mappings in docker-compose.yml:
```yaml
ports:
  - "8001:8000"  # Use port 8001 instead of 8000
```

### Database Connection Issues
1. Ensure PostgreSQL is running: `docker-compose ps`
2. Check database logs: `docker-compose logs db`
3. Verify environment variables are set correctly

### Build Issues
1. Clear Docker cache: `docker system prune -a`
2. Rebuild without cache: `docker-compose build --no-cache`

## Production Deployment

### Environment Variables
Create a `.env` file for production:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
OPENAI_API_KEY=your_openai_key
SECRET_KEY=your_secret_key
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### Security
- Never commit `.env` files to version control
- Use secrets management in production
- Run containers as non-root user (already configured)
- Enable health checks (already configured)

## Monitoring

### Health Checks
- Application: http://localhost:8000/health/ping
- Database: Automatic via docker-compose healthcheck
- Redis: Automatic via docker-compose healthcheck

### Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs web
docker-compose logs db

# Follow logs in real-time
docker-compose logs -f
```
