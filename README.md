# 🌟 Vida Coach - AI Life Improvement Platform

> An intelligent coaching platform that helps users improve their lives through AI-powered insights and goal tracking.

## 🚀 Quick Start

### 1. Setup Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your settings

# Start the backend server
python main.py
```
Backend runs on: `http://localhost:8000`

### 2. Setup Frontend
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Frontend runs on: `http://localhost:3000`

## 🔐 Authentication System

### Demo Accounts (Ready to Use)
- **Regular User**: `user@demo.com` / `password123`
- **Admin User**: `admin@demo.com` / `admin123`

### User Registration
- **Users**: Sign up normally (no special code needed)
- **Admins**: Need access code `VIDA_ADMIN_2025` during registration

### Dashboard Access
- **Users** → `/dashboard` (Personal coaching features)
- **Admins** → `/admin-dashboard` (System management)

## 📁 Project Structure

```
vida-coach-backend/
├── main.py                 # Backend entry point
├── frontend/               # Next.js frontend application
├── routes/                 # API endpoints
├── models/                 # Database models
├── services/               # Business logic
├── agents/                 # AI coaching agents
└── docs/                   # Documentation
```

## 🛠️ Development Commands

### Backend
```bash
python main.py              # Start backend server
pytest                      # Run tests
python scripts/create_demo_users.py  # Create demo accounts
```

### Frontend
```bash
cd frontend
npm run dev                 # Start development server
npm run build               # Build for production
npm run test                # Run tests
```

### Docker (Optional)
```bash
docker-compose up           # Run full stack
docker build -t vida-coach . # Build image
```

## 🧪 Testing the System

1. **Start both servers** (backend and frontend)
2. **Open browser** → `http://localhost:3000`
3. **Test registration**:
   - Try creating a regular user account
   - Try creating an admin account with code `VIDA_ADMIN_2025`
4. **Test login** with demo accounts
5. **Verify dashboards** load correctly based on user role

## 📋 API Documentation

When backend is running, visit:
- **Interactive API docs**: `http://localhost:8000/docs`
- **OpenAPI spec**: `http://localhost:8000/openapi.json`

## 🔧 Environment Variables

Required in `.env` file:
```bash
# Database
DATABASE_URL=sqlite:///./vida.db

# Authentication
SECRET_KEY=your-secret-key-here

# AI Features
OPENAI_API_KEY=your-openai-key

# Development
ENVIRONMENT=development
PORT=8000
```

## 🏗️ Architecture

### Backend (FastAPI)
- **Authentication**: JWT-based with role management
- **Database**: SQLite (development) / PostgreSQL (production)
- **AI Agents**: Modular coaching agents for different life areas
- **API**: RESTful endpoints with automatic documentation

### Frontend (Next.js)
- **Authentication**: Role-based routing and access control
- **UI**: Responsive design with Tailwind CSS
- **State Management**: React hooks and context
- **Components**: Reusable UI components

## 📚 Documentation

**Getting Started**:
- 🚀 **[Setup Guide](SETUP.md)** - Get running in 5 minutes
- 🔐 **[Authentication Guide](AUTH_GUIDE.md)** - User accounts and login
- 📡 **[API Guide](API_GUIDE.md)** - Complete API reference
- 🚨 **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues and fixes

**Advanced**:
- [🤖 AI Agents Guide](AGENTS.md) - How the coaching agents work
- [🔐 Authentication Details](FINAL_AUTH_SYSTEM_COMPLETE.md) - Complete auth system info
- [📖 Full Docs](docs/README.md) - Comprehensive documentation
- [📝 Changelog](changelog.md) - Version history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Need Help?** Check the [docs folder](docs/) for detailed guides or create an issue on GitHub.
