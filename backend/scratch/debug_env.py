import os
from dotenv import load_dotenv

# Try loading from the current directory
print(f"Current Working Directory: {os.getcwd()}")
print(f"File exists: {os.path.exists('.env')}")

load_dotenv()
key = os.getenv("GROQ_API_KEY")
if key:
    print(f"Found GROQ_API_KEY: {key[:10]}...")
else:
    print("GROQ_API_KEY NOT FOUND with default load_dotenv()")

# Try explicit path
env_path = os.path.join(os.getcwd(), '.env')
load_dotenv(env_path)
key = os.getenv("GROQ_API_KEY")
if key:
    print(f"Found GROQ_API_KEY with explicit path: {key[:10]}...")
else:
    print(f"GROQ_API_KEY NOT FOUND with explicit path: {env_path}")
