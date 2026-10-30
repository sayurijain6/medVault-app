from typing import List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends

from app.services.agent_service import AgentService
from app.services.db_service import db_service
from app.models.schemas import ReportUploadResponse, HealthScoreResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/patient", tags=["Patient"], dependencies=[Depends(get_current_user)])

service = AgentService()

@router.post("/upload-report", response_model=ReportUploadResponse)
def upload_report(patientId: str = Form(...), reportType: str = Form("blood_test"), file: UploadFile = File(...)):
    try:
        file_bytes = file.file.read()
        res = service.process_record(file.filename, file_bytes, file.content_type, patientId)
        return {"message": "Report uploaded successfully", "report": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/grant-access")
def grant_access(patientId: str, doctorId: str):
    try:
        res = service.grant_access(patientId, doctorId)
        return {"message": "Access granted", "grant": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/health-score/{patientId}", response_model=HealthScoreResponse)
def get_health_score(patientId: str):
    res = service.calculate_health_score(patientId)
    return res

@router.post("/generate-emergency-qr")
def generate_emergency_qr(patientId: str):
    return service.generate_emergency_qr(patientId)

@router.get("/my-reports/{patientId}")
def my_reports(patientId: str):
    reports = db_service.get_patient_reports(patientId)
    return {"reports": reports}

@router.get("/medications/{patientId}")
def get_medications(patientId: str):
    """Returns all meds merged with today's taken status for specific slots."""
    prescriptions = db_service.get_patient_prescriptions(patientId)
    daily_status = db_service.get_daily_med_status(patientId)
    
    all_meds = []
    for rx in prescriptions:
        for med in rx.get("medications", []):
            if isinstance(med, dict):
                m_id = med.get("m_id") or med.get("drug", "Unknown").replace(" ", "_").lower()
                slots = med.get("time_slots", ["Morning"])
                
                # Each medicine can have multiple slots, we treat them as separate entries for the timeline
                for slot in slots:
                    status_dict = daily_status.get(m_id, {})
                    is_taken = status_dict.get(slot.lower(), False)
                    
                    all_meds.append({
                        "id": f"{m_id}_{slot.lower()}",
                        "medId": m_id,
                        "drug": med.get("drug", "Unknown"),
                        "dosage": med.get("dosage", ""),
                        "frequency": med.get("frequency", ""),
                        "duration": med.get("durationDays", med.get("duration", "")),
                        "durationDays": med.get("durationDays", 0),
                        "slot": slot,
                        "taken": is_taken,
                        "time": "08:00 AM" if slot == "Morning" else ("02:00 PM" if slot == "Afternoon" else "08:00 PM"),
                        "doctorName": rx.get("doctorName", "Doctor"),
                        "prescriptionDate": rx.get("date"),
                        "diagnosis": rx.get("diagnosis", "")
                    })
    return {"medications": all_meds}

@router.post("/update-med-status")
def update_med_status(patientId: str, medId: str, slot: str, status: bool):
    """Persists the 'taken' status for a specific medication slot for today."""
    db_service.update_medication_status(patientId, medId, slot, status)
    return {"message": "Status updated"}

from app.services.mail_service import mail_service

@router.post("/send-test-email")
def send_test_email(email: str):
    """Sends a real connectivity test email via Resend."""
    res = mail_service.send_test_email(email)
    if res:
        return {"message": "Test email sent successfully"}
    raise HTTPException(status_code=500, detail="Failed to send test email")

@router.post("/trigger-adherence-alert")
def trigger_adherence_alert(patientId: str, missedMeds: List[str]):
    """Triggers a real med reminder email to the patient."""
    # Fetch user email - for hackathon we'll use the one provided or current user email
    user = db_service.get_user(patientId)
    target_email = user.get("email") if user else None
    if not target_email:
         # Fallback for demo
         target_email = "danishsjain@gmail.com"
         
    res = mail_service.send_medication_reminder(target_email, missedMeds)
    return {"message": "Alert sent"}

@router.get("/vitals/{patientId}")

def get_vitals(patientId: str):
    """Returns the most recent vitals extracted from uploaded reports."""
    vitals = db_service.get_latest_vitals(patient_id=patientId, limit=20)
    return {"vitals": vitals}

@router.post("/update-profile")
def update_profile(patientId: str, updates: dict):
    try:
        db_service.update_user_profile(patientId, updates)
        return {"message": "Profile updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/get-profile/{patientId}")
def get_profile(patientId: str):
    try:
        profile = db_service.get_user(patientId)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return profile
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/my-grants/{patientId}")
def my_grants(patientId: str):
    try:
        grants = db_service.get_patient_grants(patientId)
        return {"grants": grants}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/doctor-notes/{patientId}")
def get_doctor_notes(patientId: str, current_user: dict = Depends(get_current_user)):
    # 1. Ownership check
    if patientId != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Unauthorized access to dossier history.")
        
    notes = db_service.get_patient_notes(patientId)
    return {"notes": notes}

@router.get("/dashboard-summary/{patientId}")
def get_dashboard_summary(patientId: str, current_user: dict = Depends(get_current_user)):
    # Count reports
    reports = db_service.get_patient_reports(patientId)
    
    # Get health score without triggering an LLM agent
    health_score_doc = db_service.get_health_score(patientId)
    score = health_score_doc.get("score") if health_score_doc else None

    # Count medications
    prescriptions = db_service.get_patient_prescriptions(patientId)
    active_meds = sum(len(rx.get("medications", [])) for rx in prescriptions)

    # Count access grants
    grants = db_service.get_patient_grants(patientId)

    return {
        "total_reports": len(reports),
        "health_score": score,
        "active_meds": active_meds,
        "access_grants": len(grants)
    }

@router.get("/clinical-history/{patientId}")
def get_clinical_history(patientId: str, current_user: dict = Depends(get_current_user)):
    notes = db_service.get_patient_notes(patientId)
    import uuid
    history = []
    for n in notes:
        history.append({
            "id": n.get("noteId", uuid.uuid4().hex),
            "type": n.get("category", "diagnosis"),
            "title": n.get("title", "Clinical Note"),
            "doctor": n.get("doctorName", "Unknown"),
            "description": n.get("content", ""),
            "tags": [n.get("category", "General")],
            "date": n.get("timestamp", n.get("createdAt", ""))
        })
    return history
