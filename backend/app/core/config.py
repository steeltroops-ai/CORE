import os
from functools import lru_cache
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load environment variables from .env file
load_dotenv()


class Settings(BaseSettings):
    logic_mill_endpoint: str = "https://api.logic-mill.net/api/v1/graphql/"
    logic_mill_token: str = ""
    elevenlabs_token: str = ""
    beyond_presence_token: str = ""
    claude_api_key: str = ""
    claude_api_url: str = "https://api.anthropic.com/v1/messages"

    class Config:
        env_prefix = "CORE_"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
