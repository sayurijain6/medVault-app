import uuid
import logging
from datetime import datetime
from app.services.ocr_service import ocr_service
from app.services.document_structurer import document_structurer

logger = logging.getLogger(__name__)

class RecordAgent:
    def process_record(self, file_name: str, file_bytes: bytes, content_type: str, patient_id: str) -> dict:
        logger.info(f"🔍 [RecordAgent] Receiving file '{file_name}' for Patient {patient_id}...")
        
        # 1. OCR Extraction
        logger.info("🔍 [RecordAgent] Starting actual OCR extraction...")
        raw_text = ocr_service.extract_text(file_bytes, content_type, file_name)
        
        # 2. Document Structuring (LLM)
        logger.info("🔍 [RecordAgent] Structuring OCR text using LLM...")
        structured_data = document_structurer.structure_text(raw_text)
        
        document_type = structured_data.get("document_type", "other")
        logger.info(f"🔍 [RecordAgent] Categorization Successful! Type: '{document_type}'.")
        
        return {
            "reportId": f"rep_{uuid.uuid4().hex[:6]}",
            "patientId": patient_id,
            "filename": file_name,
            "reportType": document_type,
            "processedDate": datetime.now().isoformat(),
            "extractedData": structured_data,
            "rawText": raw_text  # Good for debugging
        }
