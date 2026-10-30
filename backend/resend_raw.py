import requests
import json
import os
from dotenv import load_dotenv

load_dotenv(override=True)

api_key = os.getenv("RESEND_API_KEY")
from_email = os.getenv("MAIL_FROM_EMAIL", "onboarding@resend.dev")

url = "https://api.resend.com/emails"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

# Try WITHOUT the "MedVault" or "hackathon" display name first
# Just the bare email as per some sandbox rules
payload = {
    "from": "onboarding@resend.dev",
    "to": ["danishsjain@gmail.com"],
    "subject": "Resend Raw Test",
    "html": "<strong>Raw HTTP success!</strong>"
}

print(f"--- RAW HTTP TEST START ---")
print(f"URL: {url}")
print(f"Key Preview (last 6): {api_key[-6:]}")

try:
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    print(f"STATUS CODE: {response.status_code}")
    print(f"RESPONSE BODY: {response.text}")
    print(f"RESPONSE HEADERS: {response.headers}")
except Exception as e:
    print(f"REQUEST FAILED: {e}")

print(f"--- RAW HTTP TEST END ---")
