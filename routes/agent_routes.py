"""Routes for agent-based AI coaching."""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from sqlalchemy.orm import Session

from database.utils import get_db
from auth.dependencies import get_current_user
from models.user import User
from schemas.agent_schemas import AgentRequest, OpenAIAgentResponse, ThreadHistory
from services.openai_agent_service import OpenAIAgentService
from models.assistant_thread import AssistantThread

router = APIRouter(prefix="/agents", tags=["agents"])


@router.post("/chat", response_model=OpenAIAgentResponse)
async def agent_chat(
    request: AgentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get a response from the user's assigned agent.
    
    This endpoint uses OpenAI's Assistants API to generate a response
    to the user's prompt. It maintains conversation context through threads.
    """
    try:
        response = await OpenAIAgentService.get_agent_response(
            db,
            current_user,
            request.prompt,
            request.context,
            request.thread_id
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing agent request: {str(e)}"
        )


@router.get("/threads/{thread_id}", response_model=dict)
async def get_thread_history(
    thread_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get the conversation history for a specific thread.
    
    Returns all messages in the thread, which can be used to display
    the conversation history in the frontend.
    """
    try:
        # Get the agent (any domain will do since we just need the client)
        agent = OpenAIAgentService.get_agent()
        
        # Get the messages
        messages = agent.client.beta.threads.messages.list(
            thread_id=thread_id,
            order="asc"
        )
        
        # Format the messages for the frontend
        formatted_messages = []
        for message in messages.data:
            content_parts = []
            for content in message.content:
                if hasattr(content, "text"):
                    content_parts.append(content.text.value)
            
            formatted_messages.append({
                "id": message.id,
                "role": message.role,
                "content": "\n".join(content_parts),
                "created_at": message.created_at
            })
        
        return {
            "thread_id": thread_id,
            "messages": formatted_messages
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving thread history: {str(e)}"
        )


@router.get("/threads", response_model=List[dict])
async def get_user_threads(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get all active conversation threads for the current user.
    
    Returns a list of threads with basic metadata that can be used
    to continue conversations.
    """
    try:
        threads = OpenAIAgentService.get_user_threads(db, current_user, limit)
        return [thread.to_dict() for thread in threads]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving user threads: {str(e)}"
        )
