from pydantic import BaseModel, Field, ConfigDict


class UserCreate(BaseModel):
    """Model for creating new users."""

    email: str
    phone_number: str | None = None
    # Accept plain password field but store internally as ``hashed_password``
    hashed_password: str = Field(alias="password")
    full_name: str | None = None
    age: int | None = None
    sex: str | None = None
    # Notes: Optional role allows creation of admin users for testing
    role: str | None = None
    # Notes: Access code required for admin registration
    access_code: str | None = None

    # Allow using either ``password`` or ``hashed_password`` when instantiating
    model_config = ConfigDict(populate_by_name=True)


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

