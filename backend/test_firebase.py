import sys
from app.firebase_config import db, bucket

def verify_connection():
    print("🔄 Testing Firebase Connection...")
    
    # 1. Test Firestore
    try:
        if db:
            doc_ref = db.collection('test_connection').document('ping')
            doc_ref.set({'status': 'connected', 'timestamp': firestore.SERVER_TIMESTAMP})
            print("✅ FIRESTORE: Connection Successful! (Document written to 'test_connection')")
        else:
            print("❌ FIRESTORE: db object is None.")
    except Exception as e:
        print(f"❌ FIRESTORE ERROR: {e}")

    # 2. Test Storage Bucket
    try:
        if bucket:
            blob = bucket.blob("test_folder/hello.txt")
            blob.upload_from_string("Hello from FastAPI backend!", content_type="text/plain")
            signed_url = blob.generate_signed_url(expiration=3600, method='GET')
            print("✅ STORAGE: Connection Successful! (File uploaded to 'test_folder/hello.txt')")
            print(f"🔗 Signed URL: {signed_url}")
        else:
            print("❌ STORAGE: bucket object is None. Check FIREBASE_STORAGE_BUCKET in .env")
    except Exception as e:
        print(f"❌ STORAGE ERROR: {e}")

if __name__ == "__main__":
    from firebase_admin import firestore
    verify_connection()
