from functools import lru_cache
from pydantic_settings import BaseSettings


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
