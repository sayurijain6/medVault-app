import os
import sys

# Mocking the environment
os.environ["RENDER"] = "true"
# Ensure no local file or env var is present to trigger the fail-fast
if "FIREBASE_CREDENTIALS_JSON" in os.environ:
    del os.environ["FIREBASE_CREDENTIALS_JSON"]

# Add backend to path to import config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

print("Testing Production Fail-Fast logic...")
try:
    from app import firebase_config
    print("FAIL: App started in production without credentials!")
except RuntimeError as e:
    print(f"SUCCESS: Caught expected production failure: {e}")
except ModuleNotFoundError as e:
    print(f"Import Error: {e}")
    # Try another path if first one fails
    sys.path.append(os.path.abspath(os.path.join(os.getcwd(), 'backend')))
    try:
        from app import firebase_config
        print("FAIL: App started in production without credentials!")
    except RuntimeError as e2:
         print(f"SUCCESS: Caught expected production failure: {e2}")
except Exception as e:
    print(f"Unexpected error: {type(e).__name__}: {e}")
