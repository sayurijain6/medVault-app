import logging
import json
from app.services.db_service import db_service
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)

class AlertAgent:
    def calculate_health_score(self, patient_id: str) -> dict:
        logger.info(f"⚠️ [AlertAgent] Calculating AI-driven health score for Patient {patient_id}...")
        
        # 1. Fetch Context
        reports = db_service.get_patient_reports(patient_id)
        vitals = db_service.get_latest_vitals(patient_id, limit=5)
        prescriptions = db_service.get_patient_prescriptions(patient_id)
        
        # 2. Prepare Context for LLM
        context = "Clinical Context for scoring:\n"
        
        if reports:
            context += "\nRecent Report Summaries:\n"
            for r in reports[:10]:
                extracted = r.get("extractedData", {})
                context += f"- [{r.get('processedDate', 'Unknown Date')}] {extracted.get('document_type', 'Report')}: {extracted.get('summary', 'No summary')}\n"
        
        if vitals:
            context += "\nLatest Vitals:\n"
            for v in vitals:
                v_str = f"- {v.get('date')}: BP: {v.get('blood_pressure', 'N/A')}, HR: {v.get('heart_rate', 'N/A')}, Temp: {v.get('temperature', 'N/A')}, Sugar: {v.get('sugar_level', 'N/A')}"
                context += v_str + "\n"
                
        if prescriptions:
            context += "\nCurrent Medications:\n"
            for p in prescriptions:
                for m in p.get("medications", []):
                    context += f"- {m.get('drug')} {m.get('dosage')} ({m.get('frequency')})\n"

        system_prompt = (
            "You are a medical risk assessment engine. Your task is to calculate a single 'Health Score' (0-100) for a patient "
            "based on their recent medical history, vitals, and medications. "
            "100 is perfectly healthy. 0 is critical/emergency. "
            "\nScoring Guidelines:\n"
            "- Critical lab values or life-threatening alerts should drop the score below 30.\n"
            "- Chronic conditions managed well (e.g. controlled diabetes) should be 70-85.\n"
            "- Acute but non-emergency issues should be 40-60.\n"
            "\nRespond STRICTLY in JSON: "
            "{\"score\": int, \"category\": \"Healthy\"|\"Fair\"|\"At Risk\", \"factors\": [\"reason1\", \"reason2\"], \"recommendation\": \"short advice\"}"
        )

        try:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": context if context.strip() != "Clinical Context for scoring:" else "No medical history available."}
            ]
            
            response_content = llm_service.chat_completion(
                messages=messages,
                model="gpt-4o-mini",
                response_format={"type": "json_object"}
            )
            
            if response_content:
                result_data = json.loads(response_content)
                result = {
                    "patientId": patient_id,
                    "score": result_data.get("score", 70),
                    "category": result_data.get("category", "Fair"),
                    "factors": result_data.get("factors", ["Automated AI assessment"]),
                    "recommendation": result_data.get("recommendation", "Continue regular monitoring.")
                }
                logger.info(f"⚠️ [AlertAgent] AI Score for {patient_id}: {result['score']} ({result['category']})")
            else:
                raise ValueError("LLM returned no content")
                
        except Exception as e:
            logger.error(f"⚠️ [AlertAgent] AI scoring failed fallback to rules: {e}")
            # Minimal fallback
            result = {
                "patientId": patient_id,
                "score": 70 if reports else 100,
                "category": "Fair" if reports else "Healthy",
                "factors": ["Rule-based fallback due to AI service issue"],
                "recommendation": "Consult a doctor for a full assessment."
            }

        # 3. Autonomous Outreach Trigger
        if result["score"] < 50:
            from app.services.mail_service import mail_service
            # For hackathon/demo, we'll send to the provided test email
            # In production, this would be user.email
            mail_service.send_health_alert(
                to_email="danishsjain@gmail.com",
                score=result["score"],
                assessment=result["recommendation"]
            )

        # Save to DB
        db_service.update_health_score(patient_id, result)
        return result

