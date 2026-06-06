from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "supersecretkeydevicepulse123!_secure_key_40_chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
