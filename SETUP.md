# Setup Guide

1. Clone the repo and install Python 3.11.
2. Copy the sample environment: `cp .env.example .env`.
3. Fill in database and API keys inside `.env`.
4. Install packages:
   ```bash
   pip install -r requirements.txt
   cd frontend && npm install
   ```
5. Run the servers:
   ```bash
   python main.py
   npm run dev
   ```

See [DOCKER_README.md](DOCKER_README.md) if you prefer Docker.

