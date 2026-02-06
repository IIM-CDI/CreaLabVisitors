import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template, Environment, FileSystemLoader
from typing import Optional, Dict, Any
import os
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class EmailService:
    
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "465"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("SMTP_FROM_EMAIL", self.smtp_username)
        self.from_name = os.getenv("SMTP_FROM_NAME", "CreaLab")
        
        self.templates_dir = os.path.join(os.path.dirname(__file__), '..', 'templates')
        self.jinja_env = Environment(loader=FileSystemLoader(self.templates_dir))
        
        if not all([self.smtp_username, self.smtp_password]):
            logger.warning("Email credentials not configured. Email service will be disabled.")
    
    def _create_message(self, to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> MIMEMultipart:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{self.from_name} <{self.from_email}>"
        message["To"] = to_email
        
        if text_content:
            text_part = MIMEText(text_content, "plain")
            message.attach(text_part)
        
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        return message
    
    def _load_template(self, template_name: str) -> Template:
        try:
            template = self.jinja_env.get_template(template_name)
            return template
        except Exception as e:
            logger.error(f"Failed to load template {template_name}: {str(e)}")
            raise
    
    def send_email(self, to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
        if not all([self.smtp_username, self.smtp_password]):
            logger.error("Email credentials not configured")
            return False
        
        try:
            message = self._create_message(to_email, subject, html_content, text_content)
            
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(self.smtp_server, self.smtp_port, timeout=10, context=context) as server:
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(message)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def send_event_approval_email(self, event_data: Dict[str, Any], approve_url: str, reject_url: str) -> bool:
        admin_email = os.getenv("ADMIN_EMAIL", "admin@crealab.com")
        
        html_template = self._load_template('event_approval.html')
        
        text_content = f"""
        New Event Approval Required
        
        Event: {event_data.get('title', 'N/A')}
        User: {event_data.get('user', 'N/A')}
        Start: {event_data.get('startStr', 'N/A')}
        End: {event_data.get('endStr', 'N/A')}
        Duration: {event_data.get('duration', 'N/A')}
        
        Approve: {approve_url}
        Reject: {reject_url}
        
        Links expire in 7 days.
        """
        
        html_content = html_template.render(
            event_title=event_data.get('title', 'N/A'),
            event_user=event_data.get('user', 'N/A'),
            event_start=event_data.get('startStr', 'N/A'),
            event_end=event_data.get('endStr', 'N/A'),
            event_duration=event_data.get('duration', 'N/A'),
            approve_url=approve_url,
            reject_url=reject_url
        )
        
        subject = f"Nouvel Event: {event_data.get('title', 'Event')}"
        
        return self.send_email(admin_email, subject, html_content, text_content)


email_service = EmailService()