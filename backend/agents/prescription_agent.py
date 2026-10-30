import uuid
from datetime import datetime
from typing import List, Dict, Any

class PrescriptionAgent:
    def create_prescription(self, data: dict) -> dict:
        """
        Takes extracted medication data and potentially enriches it with a 
        standardized adherence schedule (Morning, Afternoon, Night).
        """
        raw_meds = data.get("medications", [])
        structured_meds = []
        
        for med in raw_meds:
            # Ensure time_slots exists
            slots = med.get("time_slots", [])
            
            # If empty, try to infer from frequency string
            if not slots:
                freq = med.get("frequency", "").lower()
                # Check for common clinical shorthand or plain English
                if any(x in freq for x in ["3x", "tid", "three times"]):
                    slots = ["Morning", "Afternoon", "Night"]
                elif any(x in freq for x in ["2x", "bid", "twice", "morning and night"]):
                    slots = ["Morning", "Night"]
                elif any(x in freq for x in ["night", "pm", "bedtime"]):
                    slots = ["Night"]
                elif any(x in freq for x in ["afternoon"]):
                    slots = ["Afternoon"]
                else:
                    # Default to morning for once-daily if not specified
                    slots = ["Morning"]
            
            # Ensure every med has a stable m_id for tracking
            m_id = med.get("m_id")
            if not m_id:
                m_id = med.get("drug", "unknown").replace(" ", "_").lower().strip("_")

            structured_meds.append({
                "drug": med.get("drug", "Unknown"),
                "dosage": med.get("dosage", "As directed"),
                "frequency": med.get("frequency", "Daily"),
                "durationDays": int(med.get("durationDays", 0)),
                "time_slots": slots,
                "m_id": m_id
            })

        return {
            "prescriptionId": f"rx_{uuid.uuid4().hex[:6]}",
            "patientId": data.get("patientId"),
            "doctorId": data.get("doctorId", "AI_AGENT_EXTRACTION"),
            "doctorName": data.get("doctorName", "Doctor"),
            "date": datetime.now().isoformat(),
            "createdAt": datetime.now().isoformat(),
            "diagnosis": data.get("diagnosis", ""),
            "medications": structured_meds,
            "status": "active"
        }

prescription_agent = PrescriptionAgent()
