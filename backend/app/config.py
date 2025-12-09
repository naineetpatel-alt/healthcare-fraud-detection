"""
Application configuration management using Pydantic Settings.
"""
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Environment
    environment: str = Field(default="development", alias="ENVIRONMENT")
    debug: bool = Field(default=True, alias="DEBUG")

    # JWT Configuration
    jwt_secret_key: str = Field(..., alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(default=7, alias="REFRESH_TOKEN_EXPIRE_DAYS")

    # Database Configuration
    database_url: str = Field(default="sqlite:///./data/auth.db", alias="DATABASE_URL")
    memgraph_host: str = Field(default="localhost", alias="MEMGRAPH_HOST")
    memgraph_port: int = Field(default=7687, alias="MEMGRAPH_PORT")

    # CORS Configuration
    cors_origins: str = Field(
        default="http://localhost:3000,http://localhost:5173",
        alias="CORS_ORIGINS"
    )

    # API Configuration
    api_v1_prefix: str = Field(default="/api/v1", alias="API_V1_PREFIX")

    # OpenAI Configuration
    openai_api_key: str = Field(
        ...,  # Required environment variable
        alias="OPENAI_API_KEY",
        description="OpenAI API key for AI-generated insights"
    )
    openai_model: str = Field(default="gpt-4o-mini", alias="OPENAI_MODEL")

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
