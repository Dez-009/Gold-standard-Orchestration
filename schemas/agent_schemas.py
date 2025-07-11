"""Schema definitions for OpenAI agent responses."""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class OpenAIAgentTool(BaseModel):
    """Schema for an OpenAI Assistant tool."""
    
    type: str = Field(..., description="The type of tool, e.g., 'function'")
    function: Dict[str, Any] = Field(..., description="Function configuration")


class OpenAIAgentConfig(BaseModel):
    """Schema for OpenAI agent configuration."""
    
    model: str = Field("gpt-4o", description="The OpenAI model to use")
    instructions: Optional[str] = Field(None, description="System instructions for the assistant")
    tools: Optional[List[OpenAIAgentTool]] = Field(None, description="Tools to enable for the assistant")
    assistant_id: Optional[str] = Field(None, description="Existing assistant ID to use")
    timeout: Optional[int] = Field(None, description="Maximum time to wait for assistant response")


class OpenAIAgentResponse(BaseModel):
    """Schema for OpenAI agent responses."""
    
    response: str = Field(..., description="The text response from the agent")
    thread_id: Optional[str] = Field(None, description="The thread ID for the conversation")
    run_id: Optional[str] = Field(None, description="The run ID for the assistant execution")
    assistant_id: Optional[str] = Field(None, description="The assistant ID")
    status: str = Field(..., description="The status of the assistant run")
    error: Optional[str] = Field(None, description="Error message if any")


class AgentRequest(BaseModel):
    """Schema for agent request payloads."""
    
    prompt: str = Field(..., description="The user prompt to send to the agent")
    context: Optional[str] = Field(None, description="Additional context for the agent")
    thread_id: Optional[str] = Field(None, description="Existing thread ID to continue conversation")


class MessageContent(BaseModel):
    """Schema for message content."""
    
    type: str = Field(..., description="The type of content, e.g., 'text'")
    text: str = Field(..., description="The text content of the message")


class Message(BaseModel):
    """Schema for a conversation message."""
    
    id: str = Field(..., description="The message ID")
    role: str = Field(..., description="The role of the message sender (user or assistant)")
    content: str = Field(..., description="The content of the message")
    created_at: int = Field(..., description="The timestamp when the message was created")


class ThreadHistory(BaseModel):
    """Schema for thread conversation history."""
    
    thread_id: str = Field(..., description="The thread ID")
    messages: List[Message] = Field(..., description="List of messages in the thread")
