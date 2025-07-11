# OpenAI Assistants API Integration

This document describes the integration of OpenAI's Assistants API with the Vida Coach application.

## Overview

The OpenAI Assistants API provides a powerful way to create persistent, conversational AI assistants. This integration adds agent capabilities to Vida Coach, allowing for more contextual and personalized coaching conversations.

## Architecture

The integration consists of several components:

1. **OpenAIAgent Class**: A BaseAgent implementation that uses OpenAI's Assistants API.
2. **OpenAIAgentService**: A service that manages agent creation, persistence, and thread management.
3. **AssistantThread Model**: Database model to track and persist assistant threads.
4. **Agent Routes**: FastAPI endpoints that expose the agent functionality.

## Key Features

- **Persistent Conversations**: Conversations are maintained in OpenAI threads and persisted in the database.
- **Domain-Specific Agents**: Different coaching domains (career, health, relationship) get their own specialized agents.
- **Thread Management**: Automatic cleanup of old threads after a configurable TTL period.
- **Tool Support**: Framework for adding custom tools to enhance agent capabilities.

## Endpoints

- `POST /agents/chat`: Send a message to the agent and get a response.
- `GET /agents/threads/{thread_id}`: Get conversation history for a specific thread.
- `GET /agents/threads`: Get all active conversation threads for the current user.

## Database Schema

The `assistant_threads` table tracks OpenAI threads with the following fields:

- `id`: Primary key
- `user_id`: Foreign key to the users table
- `thread_id`: OpenAI thread ID
- `assistant_id`: OpenAI assistant ID
- `domain`: Domain of the agent (career, health, relationship, general)
- `is_active`: Boolean flag for thread activity status
- `metadata`: JSON field for additional data
- `last_message_at`: Timestamp of the last message
- `created_at`: Thread creation timestamp

## Configuration

The following settings are available in `config/settings.py`:

- `openai_api_key`: API key for OpenAI
- `openai_assistant_id`: ID of a pre-created assistant (optional)
- `openai_thread_ttl`: Number of days before threads are marked inactive
- `openai_model`: Default model to use (gpt-4o by default)

## Maintenance

A scheduled job (`cleanup_assistant_threads.py`) runs periodically to mark old threads as inactive based on the TTL setting.

## Future Enhancements

1. **Custom Tools**: Add domain-specific tools for the agents.
2. **Thread Analysis**: Analyze conversation threads for insights.
3. **Multi-Modal Support**: Add support for images and other content types.
4. **User Preferences**: Allow users to customize their agent's behavior.

## Usage Example

```python
# Example of how to use the agent in a coaching scenario
async def get_coaching_advice(db, user, prompt):
    response = await OpenAIAgentService.get_agent_response(
        db=db,
        user=user,
        prompt=prompt
    )
    return response["response"]
```
