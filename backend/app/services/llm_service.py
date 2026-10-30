import os
import logging
from typing import Optional, Dict, Any, List
from groq import Groq
from openai import OpenAI
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self._groq_client = None
        self._openai_client = None
        self._load_env()

    def _load_env(self):
        # Force load .env from project root
        env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
        
        if os.path.exists(env_path):
            load_dotenv(env_path, override=True)
            logger.info(f"✅ LLMService loaded .env from {env_path}")
        elif os.getenv("RENDER") != "true":
            # Only warn if we are NOT in production/Render
            logger.warning(f"⚠️ LLMService could not find .env at {env_path}")

    def get_groq_client(self) -> Optional[Groq]:
        key = os.getenv("GROQ_API_KEY")
        if not key:
            return None
        if not self._groq_client:
            try:
                self._groq_client = Groq(api_key=key)
            except Exception as e:
                logger.error(f"Failed to init Groq client: {e}")
                return None
        return self._groq_client

    def get_openai_client(self) -> Optional[OpenAI]:
        key = os.getenv("OPENAI_API_KEY")
        if not key:
            logger.warning("OPENAI_API_KEY not found in environment.")
            return None
        if not self._openai_client:
            try:
                self._openai_client = OpenAI(api_key=key)
            except Exception as e:
                logger.error(f"Failed to init OpenAI client: {e}")
                return None
        return self._openai_client

    def chat_completion(self, 
                        messages: List[Dict[str, str]], 
                        model: str = "gpt-4o-mini", 
                        response_format: Optional[Dict[str, str]] = None,
                        temperature: float = 0.1) -> Optional[str]:
        """
        Generic chat completion that defaults to OpenAI but can be extended.
        """
        # Try OpenAI first as requested by user
        client = self.get_openai_client()
        if client:
            try:
                logger.info(f"🚀 Calling OpenAI ({model})...")
                response = client.chat.completions.create(
                    model=model,
                    messages=messages,
                    response_format=response_format,
                    temperature=temperature,
                    max_tokens=2048
                )
                return response.choices[0].message.content
            except Exception as e:
                logger.error(f"OpenAI call failed: {e}")
        
        # Fallback to Groq if OpenAI fails or key is missing
        logger.info("🔄 Falling back to Groq...")
        groq_client = self.get_groq_client()
        if groq_client:
            try:
                groq_model = "llama3-8b-8192"
                logger.info(f"🚀 Calling Groq ({groq_model})...")
                response = groq_client.chat.completions.create(
                    model=groq_model,
                    messages=messages,
                    response_format=response_format,
                    temperature=temperature,
                    max_tokens=2048
                )
                return response.choices[0].message.content
            except Exception as e:
                logger.error(f"Groq fallback failed: {e}")

        return None

llm_service = LLMService()
