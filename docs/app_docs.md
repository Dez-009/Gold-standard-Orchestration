# Vida Coach App Docs (For Everyone!)

## What is Vida Coach?
Vida Coach is an app that helps you with your goals, habits, and wellness. It lets you track your progress, write journals, get advice from AI, and manage your account—all in one place!

## What is an API?
An API (Application Programming Interface) is like a menu for apps. It lets different programs talk to each other. For example, when you use Vida Coach on your phone or computer, the app uses the API to save your journal, check your goals, or get advice from the AI coach.

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [How Login Works](#how-login-works)
4. [Main Features (Routes)](#main-features-routes)
5. [How to Use the API](#how-to-use-the-api)
6. [Extra Stuff](#extra-stuff)

## Overview
- Vida Coach helps you:
  - Create an account
  - Write and read journals
  - Set and track goals
  - Get AI-powered coaching
  - Manage your account
  - And more!

## Getting Started
- You need Python 3.11+ and Docker (or just use the app online if you have it)
- If you want to run it yourself, you need some secret codes (called environment variables) for things like the database and AI
- To start the app, you usually run a command like:
  ```bash
  ./docker-start.sh dev
  ```
- To see the API menu (docs), go to: http://localhost:8000/docs

## How Login Works
- You make an account with your email and password
- You log in and get a special code (called a token)
- You use this code to do things like write journals or set goals

**Example:**
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "password123"
  }'
```
- The app will give you a token. Use it like this:
```http
Authorization: Bearer <your_token>
```

## Main Features (Routes)
Here are some things you can do with Vida Coach:

### 1. Users
- **Create a user:**
  ```bash
  curl -X POST "http://localhost:8000/users/" -H "Content-Type: application/json" -d '{"email": "me@example.com", "password": "password123"}'
  ```
- **Get your info:**
  ```bash
  curl -X GET "http://localhost:8000/users/1" -H "Authorization: Bearer <your_token>"
  ```

### 2. Journals
- **Write a journal:**
  ```bash
  curl -X POST "http://localhost:8000/journals/" -H "Authorization: Bearer <your_token>" -H "Content-Type: application/json" -d '{"title": "My Day", "content": "It was awesome!"}'
  ```
- **Read a journal:**
  ```bash
  curl -X GET "http://localhost:8000/journals/1" -H "Authorization: Bearer <your_token>"
  ```

### 3. Goals
- **Set a goal:**
  ```bash
  curl -X POST "http://localhost:8000/goals/" -H "Authorization: Bearer <your_token>" -H "Content-Type: application/json" -d '{"goal": "Exercise every day"}'
  ```
- **Check your goal:**
  ```bash
  curl -X GET "http://localhost:8000/goals/1" -H "Authorization: Bearer <your_token>"
  ```

### 4. AI Coaching
- **Get advice from the AI coach:**
  ```bash
  curl -X POST "http://localhost:8000/ai/coach" -H "Authorization: Bearer <your_token>" -H "Content-Type: application/json" -d '{"question": "How can I stay motivated?"}'
  ```

### 5. Health
- **Sync your habits or wearables:**
  ```bash
  curl -X POST "http://localhost:8000/habit-sync/sync" -H "Authorization: Bearer <your_token>"
  ```

## How to Use the API
- You can use tools like curl, Postman, or just the Swagger docs at http://localhost:8000/docs
- Always include your token for things that need you to be logged in
- If you get stuck, check the docs or ask for help!

## Extra Stuff
- **Admins** can see stats and manage the app
- **System routes** let you check if the app is healthy (like http://localhost:8000/health/ping)
- If you do too many things too fast, you might get rate limited (just wait a bit and try again)

---

**Remember:**
- This app is here to help you grow and stay on track!
- If you want to build your own app or bot, you can use these routes to connect to Vida Coach.
- Have fun and keep learning! 