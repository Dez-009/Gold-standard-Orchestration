from fastapi import APIRouter, HTTPException, status

from services.openai_service import get_vida_response
from schemas.vida_schemas import VidaRequest, VidaResponse

router = APIRouter(prefix="/vida", tags=["vida"])


@router.post("/coach", response_model=VidaResponse)
async def vida_coach(request: VidaRequest) -> VidaResponse:
    try:
        vida_reply = get_vida_response(request.prompt)
        return VidaResponse(response=vida_reply)
    except Exception as exc:  # pragma: no cover - simple wrapper
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process request",
        ) from exc
