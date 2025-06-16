"""Schema models for account-related responses."""

# Notes: Import BaseModel from Pydantic for data validation
from pydantic import BaseModel


# Notes: Schema returned by the /account endpoint
class AccountResponse(BaseModel):
    """Model describing user subscription status and billing info."""

    # Notes: Current subscription tier for the user
    tier: str
    # Notes: Billing information or status
    billing: str

    class Config:
        # Notes: Enable ORM compatibility if future implementations use models
        orm_mode = True
