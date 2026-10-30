import logging
import json
from app.services.db_service import db_service
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)

class IntelligenceAgent:
    def analyze_patient(self, patient_id: str) -> dict:
        logger.info(f"🧠 [IntelligenceAgent] Performing disease-specific progress analysis for Patient {patient_id}...")
        
        reports = db_service.get_patient_reports(patient_id)
        vitals = db_service.get_latest_vitals(patient_id, limit=10)
        prescriptions = db_service.get_patient_prescriptions(patient_id)
        
        if not reports and not vitals and not prescriptions:
            result = {"summary": "No medical data available.", "trends": [], "condition_tracker": None}
            db_service.save_patient_summary(patient_id, result)
            return result
            
        # Data aggregation for comparison
        # We need the most recent report and the second most recent report for comparison
        # Reports are sorted by date in db_service
        
        history_context = "Comprehensive Patient Longitudinal History:\n"
        
        if reports:
            history_context += "\nUploaded Lab Reports (Latest First):\n"
            for r in reports[:10]:
                ext = r.get("extractedData", {})
                history_context += f"- Date: {r.get('processedDate')} | Type: {ext.get('document_type')} | Diagnosis: {ext.get('diagnosis')} | Labs: {ext.get('lab_results')} | Summary: {ext.get('summary')}\n"

        system_prompt = (
            "You are a clinical diagnostic analyst. Your job is to identify the patient's primary condition and compare their 'Current State' against their 'Previous State' based on lab reports. "
            "\nOutput Requirements:\n"
            "1. Primary Summary: 2 concise sentences on overall health.\n"
            "2. Condition Tracker: Identify the primary disease being managed (e.g. Thyroid, Diabetes). "
            "Find the most important metric for that disease (e.g. TSH for Thyroid) in the latest report and the previous report. "
            "Compare them to decide if the patient is 'Better', 'Stable', or 'Declining'.\n"
            "\nResponse Format (JSON):\n"
            "{\n"
            "  \"summary\": \"...\",\n"
            "  \"condition_tracker\": {\n"
            "    \"conditionName\": \"Condition Name\",\n"
            "    \"metricName\": \"Metric (e.g. TSH)\",\n"
            "    \"latestValue\": \"Value (Unit) from Latest Date\",\n"
            "    \"previousValue\": \"Value (Unit) from Previous Date\",\n"
            "    \"status\": \"Improving | Stable | Declining\",\n"
            "    \"assessment\": \"Brief clinical explanation of the change\"\n"
            "  }\n"
            "}"
        )

        try:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": history_context}
            ]
            
            response_content = llm_service.chat_completion(
                messages=messages,
                model="gpt-4o-mini",
                response_format={"type": "json_object"}
            )
            
            if response_content:
                result = json.loads(response_content)
                result["patientId"] = patient_id
                logger.info(f"🧠 [IntelligenceAgent] Progress analysis complete for {result.get('condition_tracker', {}).get('conditionName')}")
            else:
                raise ValueError("LLM returned no content")
                
        except Exception as e:
            logger.error(f"🧠 [IntelligenceAgent] Analysis failed: {e}")
            result = {
                "patientId": patient_id,
                "summary": "Clinical history available. Comparative analysis requires manual review.",
                "condition_tracker": None
            }

        db_service.save_patient_summary(patient_id, result)
        return result
