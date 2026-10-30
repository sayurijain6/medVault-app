from fastapi import APIRouter, HTTPException, Depends
from app.services.agent_service import AgentService
from app.services.db_service import db_service
from app.models.schemas import AccessRequestReq, AccessRequestRes, OTPVerifyReq, PrescriptionCreateReq, PatientNoteCreateReq, PatientNoteEmailReq
from app.dependencies import require_doctor

router = APIRouter(prefix="/api/doctor", tags=["Doctor"], dependencies=[Depends(require_doctor)])
service = AgentService()

@router.post("/request-access", response_model=AccessRequestRes)
def request_access(req: AccessRequestReq):
    try:
        res = service.request_doctor_access(req.doctorId, patient_id=req.patientId, phone_number=req.phoneNumber, email=req.email)
        return {"message": "Access requested", "request": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-otp")
def verify_otp(req: OTPVerifyReq):
    try:
        res = service.verify_otp(req.requestId, req.otp)
        return {"message": "OTP verified", "verification": res}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/patient-summary/{patientId}")
def patient_summary(patientId: str):
    return service.analyze_patient(patientId)

@router.post("/create-prescription")
def create_prescription(req: PrescriptionCreateReq):
    try:
        res = service.create_prescription(req.model_dump())
        return {"message": "Prescription created", "prescription": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/my-patients/{doctorId}")
def my_patients(doctorId: str):
    try:
        grants = db_service.get_doctor_grants(doctorId)
        # Extract unique patient IDs
        patient_ids = list(set([g['patientId'] for g in grants]))
        
        # Enrich with patient profiles
        patients = []
        for pid in patient_ids:
            profile = db_service.get_user(pid)
            if profile:
                patients.append({
                    "id": pid,
                    "name": profile.get("displayName", "Unnamed Patient"),
                    "age": 0, # Could be derived if added to profile
                    "condition": "Active Monitoring" # Placeholder for condition
                })
        return {"patients": patients}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/patient-note")
def create_patient_note(req: PatientNoteCreateReq, current_user: dict = Depends(require_doctor)):
    # 1. Verify doctor access grant
    doctor_id = current_user["uid"]
    grants = db_service.get_active_access_grants(doctor_id, req.patientId)
    if not grants:
        raise HTTPException(status_code=403, detail="You do not have active access to this patient's clinical history.")

    import datetime
    doctor_profile = db_service.get_user(doctor_id)
    doctor_name = doctor_profile.get("displayName", "Dr. Doctor") if doctor_profile else "Doctor"

    note_data = {
        "patientId": req.patientId,
        "doctorId": doctor_id,
        "doctorName": doctor_name,
        "timestamp": datetime.datetime.now().isoformat(),
        "title": req.title,
        "content": req.content,
        "category": req.category,
        "tags": req.tags
    }
    
    note_id = db_service.save_patient_note(note_data)
    return {"message": "Clinical note synchronized", "noteId": note_id, "note": note_data}

@router.post("/create-note-email")
def create_note_by_email(req: PatientNoteEmailReq, current_user: dict = Depends(require_doctor)):
    try:
        doctor_id = current_user["uid"]
        note_data = req.model_dump()
        note_data["doctorId"] = doctor_id
        res = service.create_note(note_data)
        return {"message": "Clinical note created", **res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/patient-notes/{patientId}")
def get_patient_notes(patientId: str, current_user: dict = Depends(require_doctor)):
    # 1. Verify doctor access grant
    doctor_id = current_user["uid"]
    grants = db_service.get_active_access_grants(doctor_id, patientId)
    if not grants:
        raise HTTPException(status_code=403, detail="Access denied to patient dossier history.")

    notes = db_service.get_patient_notes(patientId)
    return {"notes": notes}

@router.get("/recent-activity")
def get_recent_activity(current_user: dict = Depends(require_doctor)):
    doctor_id = current_user["uid"]
    activity = []
    
    # 1. Fetch Prescriptions (Independent)
    try:
        prescriptions = db_service.get_doctor_prescriptions(doctor_id)
        print(f"[ActivitySync] Found {len(prescriptions)} prescriptions")
        for rx in prescriptions:
            ts = rx.get("createdAt") or rx.get("date")
            activity.append({
                "id": rx.get("prescriptionId"),
                "type": "prescription",
                "patientId": rx.get("patientId"),
                "patientName": rx.get("patientName", "Unknown Patient"),
                "timestamp": ts,
                "details": rx.get("medications", []),
                "summary": f"Prescribed {len(rx.get('medications', []))} medications"
            })
    except Exception as e:
        print(f"[ActivitySync Error] Prescriptions Query Failed: {e}")

    # 2. Fetch Clinical Notes (Independent - Sensitive to Indexing)
    try:
        notes = db_service.get_doctor_clinical_notes(doctor_id)
        print(f"[ActivitySync] Found {len(notes)} clinical notes")
        for note in notes:
            activity.append({
                "id": note.get("noteId"),
                "type": "note",
                "patientId": note.get("patientId"),
                "patientName": note.get("patientName", "Unknown Patient"),
                "timestamp": note.get("timestamp") or note.get("createdAt"),
                "details": note.get("content", ""),
                "summary": note.get("title", "Clinical Note")
            })
    except Exception as e:
        print(f"[ActivitySync Warning] Clinical Notes query failed. This is expected if the index is still building. Error: {e}")

    # 3. Sort and Return
    try:
        activity.sort(key=lambda x: x.get('timestamp', '') or '', reverse=True)
        return {"activity": activity[:25]}
    except Exception as e:
        print(f"[ActivitySync Error] Final result aggregation failed: {e}")
        return {"activity": [], "error": "Sort failed"}
