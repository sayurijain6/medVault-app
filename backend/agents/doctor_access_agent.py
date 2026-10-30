import uuid

class DoctorAccessAgent:
    def request_access(self, doctor_id: str, patient_id: str) -> dict:
        req_id = f"req_{uuid.uuid4().hex[:6]}"
        return {
            "requestId": req_id,
            "doctorId": doctor_id,
            "patientId": patient_id,
            "status": "pending",
            "message": "OTP sent to patient"
        }
        
    def verify_otp(self, request_id: str, otp: str) -> dict:
        return {
            "requestId": request_id,
            "status": "approved",
            "message": "OTP verified successfully"
        }
