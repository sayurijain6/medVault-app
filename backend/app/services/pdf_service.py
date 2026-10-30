import fitz  # PyMuPDF
import os
import io
import datetime

class PDFService:
    def generate_medical_summary_pdf(self, patient_info: dict, reports: list, prescriptions: list) -> bytes:
        """
        Generates a premium, narrative 'Blog Format' medical summary using PyMuPDF.
        """
        doc = fitz.open()
        page = doc.new_page()
        
        y = 40
        
        # --- 1. PREMIUM HEADER ---
        page.draw_rect((0, 0, 600, 80), color=(0.02, 0.05, 0.1), fill=(0.02, 0.05, 0.1))
        page.insert_text((40, 45), "MEDIALERT: CLINICAL NARRATIVE", fontsize=22, color=(1, 1, 1), fontname="Helvetica-Bold")
        page.insert_text((40, 65), f"Protocol: Emergency Responder Override | {datetime.datetime.now().strftime('%d %b %Y')}", fontsize=9, color=(0.7, 0.7, 0.7))
        y = 110

        # --- 2. EMERGENCY CONTACTS (RED ALERT BOX) ---
        page.draw_rect((40, y-10, 560, y+50), color=(0.8, 0, 0), width=1)
        page.insert_text((50, y+10), "PRIMARY RESPONDER CONTACTS", fontsize=10, color=(0.8, 0, 0), fontname="Helvetica-Bold")
        contacts = patient_info.get('emergencyContacts', [])
        if contacts:
            cx = 50
            for c in contacts[:2]:
                page.insert_text((cx, y+25), f"{c.get('name')} ({c.get('relation')})", fontsize=11, fontname="Helvetica-Bold")
                page.insert_text((cx, y+40), f"CALL: {c.get('phone')}", fontsize=11, color=(0, 0, 1))
                cx += 250
        else:
             page.insert_text((50, y+25), "No emergency contacts found in profile.", fontsize=11, color=(0.5,0.5,0.5))
        y += 80

        # --- 3. BIOMETRIC SNAPSHOT ---
        page.insert_text((40, y), "PATIENT BIOMETRICS", fontsize=14, fontname="Helvetica-Bold")
        y += 15
        page.draw_line((40, y), (560, y), color=(0,0,0), width=0.5)
        y += 20

        biometrics = [
            f"IDENTIFIER: {patient_info.get('displayName', 'Unknown')}",
            f"BLOOD TYPE: {patient_info.get('bloodType', 'Unknown')}",
            f"CHRONIC CONDITIONS: {', '.join(patient_info.get('chronicConditions', [])) if patient_info.get('chronicConditions') else 'None Listed'}",
            f"CRITICAL ALLERGIES: {', '.join(patient_info.get('allergies', [])) if patient_info.get('allergies') else 'No Known Allergies'}"
        ]
        
        for bio in biometrics:
            page.insert_text((45, y), bio, fontsize=11)
            y += 18
        y += 20

        # --- 4. CLINICAL NARRATIVE (BLOG STYLE) ---
        page.insert_text((40, y), "CLINICAL EVOLUTION & SUMMARY", fontsize=14, fontname="Helvetica-Bold")
        y += 15
        page.draw_line((40, y), (560, y), color=(0,0,0), width=0.5)
        y += 25

        # Get latest report extracted summary for narrative
        latest_summary = "No longitudinal narrative available."
        if reports:
            latest_summary = reports[0].get('extractedData', {}).get('summary', "Patient history is active with recent lab uploads.")

        # Storytelling Text Wrapping
        text = f"NARRATIVE: {latest_summary}"
        wrapped_lines = [text[i:i+95] for i in range(0, len(text), 95)]
        for line in wrapped_lines[:6]: # Show up to 6 lines
            page.insert_text((45, y), line, fontsize=10, color=(0.2, 0.2, 0.2))
            y += 14
        y += 25

        # --- 5. MEDICATION ROADMAP ---
        page.insert_text((40, y), "TREATMENT ROADMAP (ACTIVE)", fontsize=14, fontname="Helvetica-Bold")
        y += 15
        page.draw_line((40, y), (560, y), color=(0,0,0), width=0.5)
        y += 25

        if prescriptions:
            for rx in prescriptions[:3]:
                for med in rx.get('medications', []):
                    page.insert_text((45, y), f"\u2022 {med.get('drug')} [{med.get('dosage')}] - {med.get('frequency')}", fontsize=11)
                    y += 16
        else:
            page.insert_text((45, y), "No active medication roadmap detected.", fontsize=11, color=(0.5, 0.5, 0.5))
        y += 30

        # FOOOTER
        page.draw_line((40, 780), (560, 780), color=(0.8, 0.8, 0.8), width=0.5)
        page.insert_text((40, 792), "DOCUMENT SECURED BY MEDIAGENT AI | AUTHORIZED OVERRIDE ACCESS ONLY", fontsize=8, color=(0.6, 0.6, 0.6), fontname="Helvetica-Bold")

        pdf_bytes = doc.write()
        doc.close()
        return pdf_bytes

pdf_service = PDFService()
