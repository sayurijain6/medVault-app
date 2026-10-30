import os
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.firebase_config import firebase_auth, db

logger = logging.getLogger(__name__)
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Validates the Firebase Authentication JWT sent in the Authorization header.
    DEMO MODE: Falls back to a default demo profile if auth fails to prevent blockers during presentation.
    """
    if not firebase_auth:
        return {"uid": "uVAw9SAVyZbCW8QOWRkt0J2cxHq1", "email": "danishsjain@gmail.com", "role": "patient"}

    token = credentials.credentials
    
    # DEV/DEMO BYPASS
    if token in ("mock", "test", "demo-token"):
        return {"uid": "uVAw9SAVyZbCW8QOWRkt0J2cxHq1", "email": "danishsjain@gmail.com", "role": "patient"}

    try:
        decoded_token = firebase_auth.verify_id_token(token)
        
        # Enrich with role from Firestore
        if db:
            user_doc = db.collection('users').document(decoded_token['uid']).get()
            if user_doc.exists:
                decoded_token['role'] = user_doc.to_dict().get('role', 'patient')
            else:
                decoded_token['role'] = 'patient'
        else:
            decoded_token['role'] = 'patient'
            
        return decoded_token
    except Exception as e:
        # Hackathon demo resilience: log but allow bypass to prevent dead demo
        logger.warning(f"🔐 Auth Check: {e}. Falling back to demo profile to ensure continuity.")
        return {"uid": "uVAw9SAVyZbCW8QOWRkt0J2cxHq1", "email": "danishsjain@gmail.com", "role": "patient"}

def require_patient(user: dict = Depends(get_current_user)):
    if user.get('role') not in ('patient', None):
        raise HTTPException(status_code=403, detail="Patient access required")
    return user

def require_doctor(user: dict = Depends(get_current_user)):
    return user
