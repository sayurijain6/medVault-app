import os
import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
import json

# Detect Production Environment
is_production = os.getenv("RENDER") == "true"

def get_firebase_creds():
    """Logic to resolve Firebase credentials from Env Var or Local File."""
    json_creds = os.getenv("FIREBASE_CREDENTIALS_JSON")
    
    # 1. Primary: Environment Variable (Safe for Cloud)
    if json_creds:
        try:
            cred_dict = json.loads(json_creds)
            # CRITICAL: Fix double-escaped newlines in private key if they exist
            if "private_key" in cred_dict:
                cred_dict["private_key"] = cred_dict["private_key"].replace("\\n", "\n")
            return credentials.Certificate(cred_dict)
        except Exception as e:
            print(f"ERROR: Failed to parse FIREBASE_CREDENTIALS_JSON: {e}")
    
    # 2. Fallback: Local File (Development Only)
    cert_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "./firebase-service-account.json")
    abs_cert_path = os.path.abspath(cert_path)
    if os.path.exists(abs_cert_path):
        try:
            return credentials.Certificate(abs_cert_path)
        except Exception as e:
            print(f"ERROR: Failed to load local cert {abs_cert_path}: {e}")
            
    return None

# Prevent re-initialization
if not firebase_admin._apps:
    bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET", "healthcareai-a5e07.firebasestorage.app")
    cred = get_firebase_creds()
    
    if cred:
        firebase_admin.initialize_app(cred, {
            'storageBucket': bucket_name
        })
        print("Firebase Admin Initialized Successfully!")
    elif is_production:
        raise RuntimeError("FATAL: No Firebase credentials found in production environment.")
    else:
        print("WARNING: Running without valid Firebase credentials. Firestore/Storage will fail.")

# Export initialized services
db = firestore.client() if firebase_admin._apps else None
if db:
    print("Firestore Client Connected.")
else:
    print("Firestore Client NOT Connected.")

bucket = storage.bucket() if firebase_admin._apps else None
firebase_auth = auth if firebase_admin._apps else None
