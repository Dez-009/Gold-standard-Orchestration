from pydantic import BaseModel


class VidaRequest(BaseModel):
    """Model for incoming Vida coach requests."""

    prompt: str


class VidaResponse(BaseModel):
    """Model for Vida coach responses."""

    response: str
