from pydantic import BaseModel


class UserCreate(BaseModel):
    """Model for creating new users."""

    email: str
    phone_number: str | None = None
    password: str
    full_name: str | None = None
    age: int | None = None
    sex: str | None = None
    # Notes: Optional role allows creation of admin users for testing
    role: str | None = None


class UserResponse(BaseModel):
    """Model for returning user information."""

    id: int
    email: str
    phone_number: str | None = None
    full_name: str | None = None
    age: int | None = None
    sex: str | None = None
    is_active: bool
    # Notes: Include the role field in responses for completeness
    role: str | None = None

    class Config:
        orm_mode = True

