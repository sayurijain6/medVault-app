import os
import json
import resend
from dotenv import load_dotenv

# Force load .env
load_dotenv(override=True)

api_key = os.getenv("RESEND_API_KEY", "")
from_email = os.getenv("MAIL_FROM_EMAIL", "onboarding@resend.dev")
from_name = os.getenv("MAIL_FROM_NAME", "MedVault")

print(f"--- DIAGNOSTIC SCRIPT START ---")
print(f"Key Present: {len(api_key) > 0}")
if api_key:
    print(f"Key Preview (last 6): {api_key[-6:]}")
print(f"From: {from_name} <{from_email}>")
print(f"To: danishsjain@gmail.com")

resend.api_key = api_key

payload = {
    "from": f"{from_name} <{from_email}>",
    "to": ["danishsjain@gmail.com"],
    "subject": "Resend Backend Test",
    "html": "<p>This is a backend connectivity test.</p>"
}

print(f"Sending payload: {json.dumps(payload)}")

try:
    response = resend.Emails.send(payload)
    print(f"SUCCESS!")
    print(f"Response: {json.dumps(response)}")
except Exception as e:
    print(f"FAILURE!")
    error_data = {
        "error_type": type(e).__name__,
        "error_msg": str(e),
        "details": getattr(e, 'message', 'No detail'),
        "status_code": getattr(e, 'status_code', 'Unknown')
    }
    print(f"Error Details: {json.dumps(error_data, indent=2)}")

print(f"--- DIAGNOSTIC SCRIPT END ---")
