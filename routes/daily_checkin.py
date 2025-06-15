from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Notes: Import OpenAI client to generate responses after a check-in
from openai import OpenAI

# Notes: Helper to read configuration values such as the OpenAI API key
from config import get_settings

# Notes: Function used to gather recent user context for the AI prompt
from services.ai_memory_service import get_user_context_memory

from database.utils import get_db
from services import user_service, daily_checkin_service
from schemas.daily_checkin_schemas import DailyCheckInCreate, DailyCheckInResponse
from utils.logger import get_logger
from auth.dependencies import get_current_user
from models.user import User

router = APIRouter(prefix="/daily-checkins", tags=["daily-checkins"])

logger = get_logger()

# Notes: Load configuration to obtain the OpenAI API key
settings = get_settings()

# Notes: Create a reusable OpenAI client for generating feedback
client = OpenAI(api_key=settings.openai_api_key)


@router.post("/", status_code=status.HTTP_201_CREATED)
# Notes: Create a daily check-in and return AI feedback along with the record
def create_daily_checkin(
    checkin_data: DailyCheckInCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    logger.info("Creating daily check-in for user_id: %s", current_user.id)
    user = user_service.get_user(db, checkin_data.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    new_checkin = daily_checkin_service.create_daily_checkin(db, checkin_data.model_dump())
    checkin_response = DailyCheckInResponse.model_validate(new_checkin, from_attributes=True)

    # Notes: Retrieve recent context from the user's sessions and journals
    memory = get_user_context_memory(db, current_user.id)

    # Notes: Compose the text summarizing today's check-in for the AI prompt
    checkin_text = (
        f"Mood: {checkin_data.mood}. "
        f"Energy Level: {checkin_data.energy_level}. "
        f"Reflections: {checkin_data.reflections or ''}"
    )

    # Notes: Instructional system prompt guiding Vida's response
    system_prompt = (
        "You are Vida, an AI Life Coach. Based on today\u2019s check-in and the user\u2019s personal history, "
        "offer a short reflection, encouragement, or quick tip (1-2 sentences). Keep it supportive and actionable."
    )

    # Notes: Request a short supportive message from OpenAI
    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Today's Check-in: {checkin_text}\nUser Context: {memory}"},
        ],
        temperature=0.7,
        max_tokens=256,
    )

    # Notes: Extract the AI's feedback text from the response
    feedback = completion.choices[0].message.content

    # Notes: Return both the created check-in and the AI-generated feedback
    return {"checkin": checkin_response, "feedback": feedback}


@router.get("/{checkin_id}", response_model=DailyCheckInResponse)
def read_daily_checkin(checkin_id: int, db: Session = Depends(get_db)) -> DailyCheckInResponse:
    logger.info("Fetching daily check-in with ID: %s", checkin_id)
    checkin = daily_checkin_service.get_daily_checkin_by_id(db, checkin_id)
    if checkin is None:
        logger.warning("Daily check-in not found with ID: %s", checkin_id)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Daily check-in not found")
    return checkin


@router.get("/user/{user_id}", response_model=list[DailyCheckInResponse])
def read_daily_checkins_by_user(user_id: int, db: Session = Depends(get_db)) -> list[DailyCheckInResponse]:
    logger.info("Fetching all daily check-ins for user_id: %s", user_id)
    checkins = daily_checkin_service.get_daily_checkins_by_user(db, user_id)
    return checkins
