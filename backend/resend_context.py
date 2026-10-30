import os
import requests
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.getenv("RESEND_API_KEY")

def check_resend_context():
    print("--- API KEY CONTEXT CHECK ---")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # 1. Try to list domains
    print("\n1. Checking Verified Domains...")
    try:
        r = requests.get("https://api.resend.com/domains", headers=headers)
        print(f"Status: {r.status_code}")
        print(f"Data: {r.text}")
    except Exception as e:
        print(f"Error checking domains: {e}")

    # 2. Try to list API keys 
    print("\n2. Checking API Key Permissions...")
    try:
        r = requests.get("https://api.resend.com/api-keys", headers=headers)
        print(f"Status: {r.status_code}")
        print(f"Data: {r.text}")
    except Exception as e:
        print(f"Error checking keys: {e}")

if __name__ == "__main__":
    check_resend_context()
