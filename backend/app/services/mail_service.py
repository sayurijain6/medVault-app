import os
import logging
import smtplib
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional

logger = logging.getLogger(__name__)

class MailService:
    def _get_config(self):
        """Dynamic retrieval of SMTP settings."""
        return {
            "server": os.getenv("SMTP_SERVER", "smtp.gmail.com"),
            "port": int(os.getenv("SMTP_PORT", "587")),
            "user": os.getenv("SMTP_USER", ""),
            "pass": os.getenv("SMTP_PASS", ""),
            "from_email": os.getenv("MAIL_FROM_EMAIL", os.getenv("SMTP_USER", "")),
            "from_name": os.getenv("MAIL_FROM_NAME", "MediAgent")
        }

    def send_email(self, to: str, subject: str, html_content: str):
        """Standard SMTP email sender using Gmail."""
        config = self._get_config()
        logger.info(f"📧 [MailService] Triggering SMTP Outbound to: {to}")
        
        # 1. Create message
        msg = MIMEMultipart()
        msg['From'] = f"{config['from_name']} <{config['from_email']}>"
        msg['To'] = to
        msg['Subject'] = subject
        msg.attach(MIMEText(html_content, 'html'))

        try:
            # 2. Connect and Send
            server = smtplib.SMTP(config['server'], config['port'])
            server.starttls()
            server.login(config['user'], config['pass'])
            server.send_message(msg)
            server.quit()
            
            logger.info(f"✅ [MailService] SMTP Success for {to}")
            return {"status": "success", "to": to}
            
        except Exception as e:
            error_data = {
                "error_type": type(e).__name__,
                "error_msg": str(e)
            }
            logger.error(f"❌ [MailService] SMTP FAILURE: {json.dumps(error_data)}")
            return {"error": error_data, "status": "failed"}

    def send_test_email(self, to_email: str):
        subject = "MediAgent SMTP Connection Test"
        html = "<p>This is an SMTP connectivity test. If you see this, your Gmail App Password is working!</p>"
        return self.send_email(to_email, subject, html)

    def send_health_alert(self, to_email: str, score: int, assessment: str):
        subject = "🚨 URGENT: Clinical Alert from MediAgent"
        html = f"<h2>Clinical High Priority Alert</h2><p>Score: {score}/100</p><p>Assessment: {assessment}</p>"
        return self.send_email(to_email, subject, html)

    def send_medication_reminder(self, to_email: str, missed_meds: List[str]):
        subject = "Pill Reminder: Daily Adherence Check"
        med_list = ", ".join(missed_meds)
        html = f"<h2>Medication Reminder</h2><p>Meds: {med_list}</p>"
        return self.send_email(to_email, subject, html)

    def send_otp_email(self, to_email: str, otp: str):
        subject = "🔒 MediAgent: Your Patient Authorization Code"
        html = f"<h2>Authorization Request</h2><p>A doctor is requesting access to your medical records.</p><p>Your Authorization Code is: <b style='font-size: 24px;'>{otp}</b></p><p>Please share this code with the requesting doctor to grant them access.</p>"
        return self.send_email(to_email, subject, html)

# Singleton
mail_service = MailService()
