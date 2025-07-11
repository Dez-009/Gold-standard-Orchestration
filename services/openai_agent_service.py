"""Service for managing OpenAI agents and conversations."""

from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
import datetime

from agents.openai_agent import OpenAIAgent
from models.user import User
from models.agent_interaction_log import AgentInteractionLog
from models.agent_assignment import AgentAssignment
from models.assistant_thread import AssistantThread
from config import get_settings
from utils.logger import get_logger

logger = get_logger()


class OpenAIAgentService:
    """Service for managing OpenAI Assistant agents."""
    
    # Cache of OpenAI agents by domain
    _agent_cache: Dict[str, OpenAIAgent] = {}
    
    @classmethod
    def get_agent(cls, domain: str = "general") -> OpenAIAgent:
        """
        Get or create an OpenAI agent for a specific domain.
        
        Args:
            domain: The domain for the agent (e.g., "career", "health", "relationship")
            
        Returns:
            An OpenAIAgent instance
        """
        if domain not in cls._agent_cache:
            # Create domain-specific instructions
            instructions = cls._get_domain_instructions(domain)
            
            # Create a new agent
            agent = OpenAIAgent(
                model="gpt-4o",
                instructions=instructions
            )
            
            # Cache the agent
            cls._agent_cache[domain] = agent
            
        return cls._agent_cache[domain]
    
    @staticmethod
    def _get_domain_instructions(domain: str) -> str:
        """Get domain-specific instructions for the agent."""
        base_instructions = (
            "You are Vida, an AI Life Coach with a supportive, real-talk personality. "
            "You speak like a wise friend, help users clarify goals, stay accountable, "
            "ask powerful reflection questions, give example choices, and close with "
            "next steps."
        )
        
        domain_specific = {
            "career": (
                "Focus on career development, job satisfaction, professional growth, "
                "work-life balance, and professional goal-setting. Help the user navigate "
                "workplace challenges, career transitions, and skill development."
            ),
            "health": (
                "Focus on physical and mental health, wellness practices, fitness goals, "
                "nutrition, stress management, and healthy habits. Help the user develop "
                "sustainable routines and overcome health-related challenges."
            ),
            "relationship": (
                "Focus on interpersonal relationships, communication skills, boundary-setting, "
                "conflict resolution, and emotional intelligence. Help the user navigate "
                "social interactions and build meaningful connections."
            )
        }
        
        if domain in domain_specific:
            return f"{base_instructions}\n\n{domain_specific[domain]}"
        return base_instructions
    
    @staticmethod
    async def get_agent_response(
        db: Session,
        user: User,
        prompt: str,
        context: Optional[str] = None,
        thread_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get a response from the appropriate agent for a user.
        
        Args:
            db: Database session
            user: The user making the request
            prompt: The user's prompt
            context: Optional additional context
            thread_id: Optional thread ID for continuing a conversation
            
        Returns:
            The agent's response
        """
        # Get the user's agent assignment
        assignment = db.query(AgentAssignment).filter_by(user_id=user.id).first()
        
        # Default to general domain if no assignment exists
        domain = assignment.agent_type if assignment else "general"
        
        # Get or create the agent
        agent = OpenAIAgentService.get_agent(domain)
        
        # Try to find the existing thread in the database if thread_id is provided
        db_thread = None
        if thread_id:
            db_thread = db.query(AssistantThread).filter_by(
                thread_id=thread_id, 
                user_id=user.id
            ).first()
            
            # If the thread doesn't exist in our database, don't use it
            if not db_thread:
                thread_id = None
                
        # Get the agent response
        response_data = await agent.run(prompt, context, thread_id)
        
        # If this is a new thread, save it to the database
        if not db_thread and response_data.get("thread_id"):
            db_thread = AssistantThread(
                user_id=user.id,
                thread_id=response_data["thread_id"],
                assistant_id=response_data["assistant_id"],
                domain=domain,
                metadata={
                    "initial_prompt": prompt,
                    "model": agent.model
                }
            )
            db.add(db_thread)
        # If we have an existing thread, update the last_message_at timestamp
        elif db_thread:
            db_thread.last_message_at = datetime.datetime.now()
            
        # Log the interaction
        interaction_log = AgentInteractionLog(
            user_id=user.id,
            agent_type=domain,
            user_prompt=prompt,
            ai_response=response_data["response"],
            metadata={
                "thread_id": response_data.get("thread_id"),
                "run_id": response_data.get("run_id"),
                "assistant_id": response_data.get("assistant_id"),
                "status": response_data.get("status")
            }
        )
        db.add(interaction_log)
        db.commit()
        
        return response_data
        
    @staticmethod
    def get_user_threads(db: Session, user: User, limit: int = 10) -> List[AssistantThread]:
        """
        Get the user's recent assistant threads.
        
        Args:
            db: Database session
            user: The user to get threads for
            limit: Maximum number of threads to return
            
        Returns:
            List of assistant threads
        """
        return db.query(AssistantThread).filter_by(
            user_id=user.id, 
            is_active=True
        ).order_by(
            desc(AssistantThread.last_message_at)
        ).limit(limit).all()
    
    @staticmethod
    def cleanup_old_threads(db: Session) -> int:
        """
        Clean up threads older than the TTL setting.
        
        Args:
            db: Database session
            
        Returns:
            Number of threads marked as inactive
        """
        settings = get_settings()
        ttl_days = settings.openai_thread_ttl
        
        # Calculate the cutoff date
        cutoff_date = datetime.datetime.now() - datetime.timedelta(days=ttl_days)
        
        # Find threads older than the cutoff
        old_threads = db.query(AssistantThread).filter(
            AssistantThread.last_message_at < cutoff_date,
            AssistantThread.is_active == True
        ).all()
        
        # Mark the threads as inactive
        count = 0
        for thread in old_threads:
            thread.is_active = False
            count += 1
            
        db.commit()
        return count
