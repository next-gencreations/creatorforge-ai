from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://creatorforge:creatorforge@localhost:5432/creatorforge"
    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    cors_origins: list[str] = ["http://localhost:3000"]

    anthropic_api_key: str = ""
    anthropic_model: str = "claude-opus-5"

    storage_root: str = "uploads"
    storage_quota_bytes: int = 5 * 1024 * 1024 * 1024


settings = Settings()
