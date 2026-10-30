import os

class Settings:
    PORT: int = int(os.getenv("PORT", 8000))

settings = Settings()
