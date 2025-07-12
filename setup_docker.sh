#!/bin/bash

# Vida Coach Docker Setup Script

echo "🚀 Setting up Vida Coach with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Vida Coach Backend Environment Variables

# Database Configuration
DATABASE_URL=postgresql://postgres:password@db:5432/vida_coach

# Security
SECRET_KEY=dev-secret-key-change-in-production

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Stripe Configuration (for billing features)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Rate Limiting
RATE_LIMIT=100/minute

# Application Settings
ENVIRONMENT=development
PORT=8000

# Feature Flags (comma-separated)
ENABLED_FEATURES=journal,goals,coaching,admin,analytics

# Redis Configuration (for caching and sessions)
REDIS_URL=redis://redis:6379

# Logging
LOG_LEVEL=INFO

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000
EOF
    echo "✅ .env file created. Please update the values as needed."
fi

# Build and start the services
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "🎉 Vida Coach is starting up!"
echo ""
echo "📱 Frontend: http://localhost:3001"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🗄️  Database: localhost:5433 (postgres/vida_coach)"
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart services: docker-compose restart"
echo "  Rebuild: docker-compose up --build"
echo ""
echo "⚠️  Remember to:"
echo "  1. Update OPENAI_API_KEY in .env file"
echo "  2. Update other API keys as needed"
echo "  3. Run database migrations if needed" 