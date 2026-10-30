import os
import resend
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.getenv("RESEND_API_KEY")
resend.api_key = api_key

# TRY SENDING TO THE ACCOUNT OWNER (Most reliable test)
to_email = "danishsjain@gmail.com" 

print(f"--- FINAL DIAGNOSTIC ---")
print(f"Key: {api_key[-6:]}")

try:
    # Attempt 1: Bare email
    print("Attempt 1: Bare email from onboarding@resend.dev")
    r1 = resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": to_email,
        "subject": "Resend Test 1",
        "html": "Test 1"
    })
    print(f"R1 Success: {r1}")
except Exception as e:
    print(f"R1 Fail: {e}")

try:
    # Attempt 2: With name 'hackathon'
    print("Attempt 2: With name 'hackathon'")
    r2 = resend.Emails.send({
        "from": "hackathon <onboarding@resend.dev>",
        "to": to_email,
        "subject": "Resend Test 2",
        "html": "Test 2"
    })
    print(f"R2 Success: {r2}")
except Exception as e:
    print(f"R2 Fail: {e}")
