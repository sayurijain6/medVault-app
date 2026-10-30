import uuid

class AccessAgent:
    def grant_access(self, patient_id: str, doctor_id: str) -> dict:
        print(f"🔐 [AccessAgent] Processing Access Grant from Patient {patient_id} to Doctor {doctor_id}...")
        print(f"🔐 [AccessAgent] Simulating OTP generation & verification logic...")
        print("🔐 [AccessAgent] Success: Full read permissions granted.")
        
        return {
            "grantId": f"grant_{uuid.uuid4().hex[:6]}",
            "patientId": patient_id,
            "doctorId": doctor_id,
            "status": "active"
        }
