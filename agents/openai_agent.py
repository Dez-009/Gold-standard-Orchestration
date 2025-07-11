"""Implementation of an OpenAI Assistant-based agent."""

from __future__ import annotations

import time
from typing import Optional, Dict, Any, List
import json

from openai import OpenAI, BadRequestError
from openai.types.beta.assistant import Assistant
# Do not import ThreadMessage directly to avoid version compatibility issues
from typing import Any

from config import get_settings
from agents.base import BaseAgent
from utils.logger import get_logger

logger = get_logger()


class OpenAIAgent(BaseAgent):
    """Agent implementation using OpenAI's Assistants API."""

    name: str = "openai_assistant"

    def __init__(
        self,
        model: str = "gpt-4o",
        instructions: str = None,
        tools: Optional[List[Dict[str, Any]]] = None,
        assistant_id: Optional[str] = None,
        timeout: int = None,
    ):
        """
        Initialize an OpenAI Assistant agent.
        
        Args:
            model: The OpenAI model to use
            instructions: System instructions for the assistant
            tools: List of tools to enable for the assistant
            assistant_id: Optional existing assistant ID to use
            timeout: Maximum time to wait for the assistant response in seconds
        """
        self.client = OpenAI(api_key=get_settings().openai_api_key)
        self.model = model
        self.instructions = instructions or "You are Vida, an AI Life Coach with a supportive, real-talk personality. You speak like a wise friend, help users clarify goals, stay accountable, ask powerful reflection questions, give example choices, and close with next steps."
        self.tools = tools or []
        self.assistant_id = assistant_id
        self.timeout = timeout or get_settings().AGENT_TIMEOUT_SECONDS
        self.assistant = None
        
        # If assistant_id is not provided, create a new assistant
        if not self.assistant_id:
            self._create_assistant()
        else:
            self._load_assistant()

    def _create_assistant(self) -> None:
        """Create a new OpenAI Assistant."""
        try:
            self.assistant = self.client.beta.assistants.create(
                name="Vida Coach",
                description="An AI life coach that helps users with their goals and personal development",
                instructions=self.instructions,
                model=self.model,
                tools=self.tools
            )
            self.assistant_id = self.assistant.id
            logger.info(f"Created new OpenAI Assistant with ID: {self.assistant_id}")
        except Exception as e:
            logger.error(f"Failed to create OpenAI Assistant: {str(e)}")
            raise

    def _load_assistant(self) -> None:
        """Load an existing OpenAI Assistant."""
        try:
            self.assistant = self.client.beta.assistants.retrieve(self.assistant_id)
            logger.info(f"Loaded existing OpenAI Assistant with ID: {self.assistant_id}")
        except Exception as e:
            logger.error(f"Failed to load OpenAI Assistant: {str(e)}")
            raise

    async def run(self, prompt: str, context: Optional[str] = None, thread_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Send a message to the OpenAI Assistant and wait for a response.
        
        Args:
            prompt: The user message to send
            context: Optional additional context to include
            thread_id: Optional existing thread ID to continue a conversation
            
        Returns:
            A dictionary containing the assistant's response and metadata
        """
        try:
            # Create a new thread or use an existing one
            if thread_id:
                thread = self.client.beta.threads.retrieve(thread_id)
            else:
                thread = self.client.beta.threads.create()
            
            # Add the user message to the thread
            full_message = prompt
            if context:
                full_message = f"{prompt}\n\nContext: {context}"
                
            self.client.beta.threads.messages.create(
                thread_id=thread.id,
                role="user",
                content=full_message
            )
            
            # Run the assistant
            run = self.client.beta.threads.runs.create(
                thread_id=thread.id,
                assistant_id=self.assistant_id
            )
            
            # Wait for the run to complete
            run = self._wait_for_run(thread.id, run.id)
            
            # Handle any required actions (tool calls)
            if run.status == "requires_action":
                run = self._handle_tool_calls(thread.id, run)
            
            # Get the assistant's response
            messages = self.client.beta.threads.messages.list(
                thread_id=thread.id,
                order="desc",
                limit=1
            )
            
            # Return the response and metadata
            response_text = self._extract_message_content(messages.data[0])
            
            return {
                "response": response_text,
                "thread_id": thread.id,
                "run_id": run.id,
                "assistant_id": self.assistant_id,
                "status": run.status
            }
            
        except Exception as e:
            logger.error(f"Error in OpenAI Assistant run: {str(e)}")
            return {
                "response": f"I'm sorry, I encountered an error: {str(e)}",
                "status": "error",
                "error": str(e)
            }
    
    def _wait_for_run(self, thread_id: str, run_id: str):
        """Wait for an assistant run to complete."""
        start_time = time.time()
        while True:
            # Check if we've exceeded the timeout
            if time.time() - start_time > self.timeout:
                raise TimeoutError(f"Assistant run timed out after {self.timeout} seconds")
                
            # Check the run status
            run = self.client.beta.threads.runs.retrieve(
                thread_id=thread_id,
                run_id=run_id
            )
            
            if run.status in ["completed", "failed", "cancelled", "expired"]:
                return run
            
            # Wait before checking again
            time.sleep(1)
            
    def _extract_message_content(self, message: Any) -> str:
        """Extract text content from an assistant message."""
        content_parts = []
        
        for content in message.content:
            if hasattr(content, "text"):
                content_parts.append(content.text.value)
                
        return "\n".join(content_parts)
    
    def _handle_tool_calls(self, thread_id: str, run):
        """
        Handle tool calls required by the assistant.
        
        This is a stub implementation that can be extended to support
        various tools like searching databases, calling APIs, etc.
        
        Args:
            thread_id: The thread ID
            run: The run object requiring action
            
        Returns:
            The updated run object
        """
        if not hasattr(run, "required_action") or not run.required_action:
            return run
            
        tool_outputs = []
        
        for tool_call in run.required_action.submit_tool_outputs.tool_calls:
            # Extract the function name and arguments
            function_name = tool_call.function.name
            arguments = json.loads(tool_call.function.arguments)
            
            # Handle different tool types
            if function_name == "search_knowledge_base":
                # Example tool implementation
                result = {"results": "This is a placeholder for search results"}
            elif function_name == "get_user_goals":
                # Example tool implementation
                result = {"goals": ["Goal 1", "Goal 2", "Goal 3"]}
            else:
                # Default response for unknown tools
                result = {"error": f"Tool {function_name} not implemented"}
                
            # Add the tool output
            tool_outputs.append({
                "tool_call_id": tool_call.id,
                "output": json.dumps(result)
            })
            
        # Submit the tool outputs
        run = self.client.beta.threads.runs.submit_tool_outputs(
            thread_id=thread_id,
            run_id=run.id,
            tool_outputs=tool_outputs
        )
        
        # Wait for the run to complete after tool submission
        return self._wait_for_run(thread_id, run.id)
