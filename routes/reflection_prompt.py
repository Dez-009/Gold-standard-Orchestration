"""Routes for retrieving reflection prompts for a user."""

# Notes: FastAPI helpers for routing and dependency injection
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# Notes: Import auth and DB utilities
from auth.dependencies import get_current_user
from database.utils import get_db

# Notes: Schema used to serialize prompts
from schemas.reflection_prompt import ReflectionPromptResponse

# Notes: Service layer functions
from services import reflection_prompt_service

# Notes: SQLAlchemy user model type
from models.user import User

router = APIRouter(prefix="/reflection-prompts", tags=["reflection-prompts"])


@router.get("/user/{user_id}", response_model=list[ReflectionPromptResponse])
# Notes: Endpoint returning all prompts for the specified user
def get_prompts(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ReflectionPromptResponse]:
    """Return reflection prompts previously generated for the user."""

    # Notes: Restrict access so users can only read their own prompts
    if user_id != current_user.id:
        return []

    prompts = reflection_prompt_service.get_prompts_by_user(db, user_id)
    # Notes: Pydantic will handle conversion thanks to orm_mode
    return prompts

# Footnote: Only read operation is exposed; creation happens in the pipeline.
