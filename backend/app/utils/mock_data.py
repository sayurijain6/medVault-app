MOCK_PATIENTS = {
    "patient_123": {
        "patientId": "patient_123",
        "name": "John Doe",
        "age": 45,
        "bloodType": "O+",
        "allergies": ["Penicillin"],
        "chronicConditions": ["Type 2 Diabetes", "Hypertension"]
    }
}

MOCK_DOCTORS = {
    "doc_456": {
        "doctorId": "doc_456",
        "name": "Dr. Smith",
        "specialty": "Endocrinology"
    }
}

MOCK_REPORTS = {
    "patient_123": [
        {
            "reportId": "rep_1",
            "reportType": "blood_test",
            "uploadDate": "2026-04-01",
            "extractedData": {"hemoglobin": 12.5, "wbc": 8000}
        }
    ]
}

MOCK_PRESCRIPTIONS = {
    "patient_123": []
}

MOCK_ACCESS_REQUESTS = {}
MOCK_ACCESS_GRANTS = {}

def get_mock_patient(patient_id: str):
    return MOCK_PATIENTS.get(patient_id)

def get_mock_reports(patient_id: str):
    return MOCK_REPORTS.get(patient_id, [])

def get_mock_health_score(patient_id: str):
    return {"score": 85, "category": "Healthy", "factors": ["Normal BP", "Good Adherence"]}
