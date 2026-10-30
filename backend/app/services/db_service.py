from app.firebase_config import db
from google.cloud.firestore import Query

class DBService:
    def get_user(self, user_id: str) -> dict | None:
        if not db: return None
        doc = db.collection('users').document(user_id).get()
        return doc.to_dict() if doc.exists else None
        
    def save_user(self, user_data: dict):
        if not db: return
        user_id = user_data.get("uid")
        db.collection('users').document(user_id).set(user_data, merge=True)

    def update_user_profile(self, user_id: str, updates: dict):
        if not db: return
        db.collection('users').document(user_id).set(updates, merge=True)

    def get_user_by_phone(self, phone_number: str) -> dict | None:
        if not db: return None
        # Clean phone number for consistency
        phone = phone_number.strip().replace(" ", "")
        docs = db.collection('users').where('phoneNumber', '==', phone).limit(1).get()
        return docs[0].to_dict() if docs else None

    def get_user_by_email(self, email: str) -> dict | None:
        if not db: return None
        email_clean = email.strip().lower()
        docs = db.collection('users').where('email', '==', email_clean).limit(1).get()
        return docs[0].to_dict() if docs else None

    def get_user_profile(self, user_id: str) -> dict | None:
        if not db: return None
        doc = db.collection('users').document(user_id).get()
        if not doc.exists: return None
        data = doc.to_dict()
        # Ensure critical info fields exist for emergency
        return {
            "uid": user_id,
            "email": data.get("email"),
            "bloodType": data.get("bloodType", "Unknown"),
            "allergies": data.get("allergies", []),
            "chronicConditions": data.get("chronicConditions", []),
            "emergencyContacts": data.get("emergencyContacts", []),
            "displayName": data.get("displayName", "Patient")
        }

    def save_report(self, report_data: dict):
        if not db: return
        report_id = report_data.get('reportId')
        db.collection('reports').document(report_id).set(report_data)

    def get_patient_reports(self, patient_id: str) -> list:
        if not db: return []
        docs = db.collection('reports').where('patientId', '==', patient_id).stream()
        reports = [doc.to_dict() for doc in docs]
        # Sort in memory by processedDate descending
        reports.sort(key=lambda x: x.get('processedDate', ''), reverse=True)
        return reports


    def save_access_grant(self, grant_data: dict):
        if not db: return
        db.collection('access_grants').document(grant_data['grantId']).set(grant_data)

    def get_active_access_grants(self, doctor_id: str, patient_id: str) -> list:
        if not db: return []
        docs = db.collection('access_grants').where('doctorId', '==', doctor_id)\
                                             .where('patientId', '==', patient_id)\
                                             .where('status', '==', 'active').stream()
        return [doc.to_dict() for doc in docs]

    def get_doctor_grants(self, doctor_id: str) -> list:
        if not db: return []
        docs = db.collection('access_grants').where('doctorId', '==', doctor_id)\
                                             .where('status', '==', 'active').stream()
        return [doc.to_dict() for doc in docs]

    def get_patient_grants(self, patient_id: str) -> list:
        if not db: return []
        docs = db.collection('access_grants').where('patientId', '==', patient_id)\
                                             .where('status', '==', 'active').stream()
        return [doc.to_dict() for doc in docs]

    def save_prescription(self, rx_data: dict):
        if not db: return
        db.collection('prescriptions').document(rx_data['prescriptionId']).set(rx_data)

    def get_patient_prescriptions(self, patient_id: str) -> list:
        if not db: return []
        docs = db.collection('prescriptions').where('patientId', '==', patient_id).stream()
        return [doc.to_dict() for doc in docs]

    def save_access_request(self, req_data: dict):
        if not db: return
        db.collection('access_requests').document(req_data['requestId']).set(req_data)

    def get_access_request(self, request_id: str) -> dict | None:
        if not db: return None
        doc = db.collection('access_requests').document(request_id).get()
        return doc.to_dict() if doc.exists else None

    def save_vitals(self, patient_id: str, report_id: str, vitals_data: dict):
        if not db: return
        import datetime
        vitals_data['patientId'] = patient_id
        vitals_data['sourceReportId'] = report_id
        vitals_data['date'] = datetime.datetime.now().isoformat()
        db.collection('vitals').add(vitals_data)
        
    def get_latest_vitals(self, patient_id: str, limit: int = 20) -> list:
        if not db: return []
        # Removed .order_by() to avoid composite index requirement in Firestore
        docs = db.collection('vitals').where('patientId', '==', patient_id).stream()
        vitals_list = [doc.to_dict() for doc in docs]
        # Sort in memory by date descending
        vitals_list.sort(key=lambda x: x.get('date', ''), reverse=True)
        return vitals_list[:limit]

    def update_health_score(self, patient_id: str, score_data: dict):
        if not db: return
        db.collection('health_scores').document(patient_id).set(score_data)
        
    def get_health_score(self, patient_id: str) -> dict | None:
        if not db: return None
        doc = db.collection('health_scores').document(patient_id).get()
        return doc.to_dict() if doc.exists else None

    def save_patient_summary(self, patient_id: str, summary_data: dict):
        if not db: return
        db.collection('patient_summaries').document(patient_id).set(summary_data)

    def get_patient_summary(self, patient_id: str) -> dict | None:
        if not db: return None
        doc = db.collection('patient_summaries').document(patient_id).get()
        return doc.to_dict() if doc.exists else None

    def update_medication_status(self, patient_id: str, med_id: str, slot: str, status: bool):
        if not db: return
        import datetime
        today = datetime.date.today().isoformat()
        # Use a combination of date, medication ID, and time slot for the document ID
        doc_id = f"{today}_{med_id}_{slot.lower()}"
        db.collection('users').document(patient_id).collection('daily_meds').document(doc_id).set({
            "medId": med_id,
            "slot": slot,
            "status": status,
            "date": today,
            "updatedAt": datetime.datetime.now().isoformat()
        })

    def get_daily_med_status(self, patient_id: str) -> dict:
        if not db: return {}
        import datetime
        today = datetime.date.today().isoformat()
        docs = db.collection('users').document(patient_id).collection('daily_meds').where('date', '==', today).stream()
        
        # Return a nested dictionary: { medId: { slot: status } }
        status_map = {}
        for doc in docs:
            data = doc.to_dict()
            m_id = data['medId']
            slot = data.get('slot', 'morning').lower()
            if m_id not in status_map:
                status_map[m_id] = {}
            status_map[m_id][slot] = data['status']
        return status_map

    def save_patient_note(self, note_data: dict):
        if not db: return
        import uuid
        note_id = f"note_{uuid.uuid4().hex[:8]}"
        note_data["noteId"] = note_id
        patient_id = note_data.get("patientId")
        db.collection('users').document(patient_id).collection('notes').document(note_id).set(note_data)
        return note_id

    def get_patient_notes(self, patient_id: str) -> list:
        if not db: return []
        docs = db.collection('users').document(patient_id).collection('notes').stream()
        notes = [doc.to_dict() for doc in docs]
        # Sort by timestamp descending
        notes.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        return notes

    def get_doctor_prescriptions(self, doctor_id: str) -> list:
        if not db: return []
        docs = db.collection('prescriptions').where('doctorId', '==', doctor_id).stream()
        return [doc.to_dict() for doc in docs]

    def get_doctor_clinical_notes(self, doctor_id: str) -> list:
        if not db: return []
        # Requires a Collection Group Index in Firestore for 'notes'
        docs = db.collection_group('notes').where('doctorId', '==', doctor_id).stream()
        return [doc.to_dict() for doc in docs]

db_service = DBService()

