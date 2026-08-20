from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "PDF Extractor API"
    app_version: str = "1.0.0"
    debug: bool = True

    api_prefix: str = "/api/v1"

    max_file_size_mb: int = 5
    max_page_count: int = 100

    # MongoDB
    mongodb_url: str
    mongodb_database: str = "pdf_extractor"

    # JWT
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024


settings = Settings()