import os
import json
from fastapi import APIRouter
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/debug", tags=["Debug"])

@router.get("/env")
def get_env_debug():
    # Return existence of keys and first few chars for privacy
    keys_to_check = ["GROQ_API_KEY", "OPENAI_API_KEY", "FIREBASE_STORAGE_BUCKET"]
    debug_info = {}
    for k in keys_to_check:
        val = os.getenv(k)
        if val:
            debug_info[k] = f"EXISTS (starts with {val[:4]}...)"
        else:
            debug_info[k] = "MISSING"
            
    debug_info["cwd"] = os.getcwd()
    debug_info["pid"] = os.getpid()
    
    # Check if .env is findable from here
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    debug_info["expected_env_path"] = env_path
    debug_info["env_file_exists"] = os.path.exists(env_path)
    
    return debug_info
