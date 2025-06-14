from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    project_name: str = "Vida Coach API"
    openai_api_key: str
    environment: str = "development"
    port: int = 8000
    database_url: str

    class Config:
        env_file = ".env"


settings = Settings()

