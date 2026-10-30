from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ReportUploadResponse(BaseModel):
    message: str
    report: Dict[str, Any]

class AccessRequestReq(BaseModel):
    doctorId: str
    patientId: Optional[str] = None
    phoneNumber: Optional[str] = None
    email: Optional[str] = None

class AccessRequestRes(BaseModel):
    message: str
    request: Dict[str, Any]

class OTPVerifyReq(BaseModel):
    otp: str
    requestId: str

class Medication(BaseModel):
    drug: str
    dosage: str
    frequency: str
    durationDays: int

class PrescriptionCreateReq(BaseModel):
    patientEmail: str
    doctorId: str
    diagnosis: Optional[str] = None
    medications: List[Medication]

class HealthScoreResponse(BaseModel):
    patientId: str
    score: int
    category: str
    factors: List[str]

class EmergencyContact(BaseModel):
    name: str
    relation: str
    phone: str

class UserRegisterReq(BaseModel):
    role: str
    email: Optional[str] = None
    bloodType: Optional[str] = "Unknown"
    emergencyContacts: Optional[List[EmergencyContact]] = []

class EmergencyQRRequest(BaseModel):
    patientId: str

class ScanQRReq(BaseModel):
    qrData: str

class PatientNoteCreateReq(BaseModel):
    patientId: str
    title: str
    content: str
    category: Optional[str] = "observation" # allergy, medication, observation, diagnosis, follow-up, warning
    tags: Optional[List[str]] = []

class PatientNoteEmailReq(BaseModel):
    patientEmail: str
    title: str
    content: str
    category: Optional[str] = "observation"
