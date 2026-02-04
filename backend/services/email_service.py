import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template
from typing import Optional, Dict, Any
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


class EmailService:
    """Clean and simple email service for CreaLab notifications"""
    
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "465"))  # Use SSL port as default
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("SMTP_FROM_EMAIL", self.smtp_username)
        self.from_name = os.getenv("SMTP_FROM_NAME", "CreaLab")
        
        if not all([self.smtp_username, self.smtp_password]):
            logger.warning("Email credentials not configured. Email service will be disabled.")
    
    def _create_message(self, to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> MIMEMultipart:
        """Create email message with HTML and optional text content"""
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{self.from_name} <{self.from_email}>"
        message["To"] = to_email
        
        # Add text version if provided
        if text_content:
            text_part = MIMEText(text_content, "plain")
            message.attach(text_part)
        
        # Add HTML version
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        return message
    
    def send_email(self, to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
        """Send email using Gmail SSL (Port 465)"""
        if not all([self.smtp_username, self.smtp_password]):
            logger.error("Email credentials not configured")
            return False
        
        try:
            message = self._create_message(to_email, subject, html_content, text_content)
            
            # Use SSL connection (Port 465) - the working method
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
        """Send event approval email to admin"""
        admin_email = os.getenv("ADMIN_EMAIL", "admin@crealab.com")
        
        html_template = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { background: #f9f9f9; padding: 20px; }
                .event-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
                .actions { text-align: center; margin: 30px 0; }
                .btn { display: inline-block; padding: 12px 30px; margin: 0 10px; text-decoration: none; border-radius: 5px; font-weight: bold; }
                .btn-approve { background: #4CAF50; color: white; }
                .btn-reject { background: #f44336; color: white; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📅 New Event Approval Required</h1>
                </div>
                
                <div class="content">
                    <p>Hello Admin,</p>
                    <p>A new event has been submitted and requires your approval:</p>
                    
                    <div class="event-details">
                        <h3>{{ event_title }}</h3>
                        <p><strong>User:</strong> {{ event_user }}</p>
                        <p><strong>Start:</strong> {{ event_start }}</p>
                        <p><strong>End:</strong> {{ event_end }}</p>
                        <p><strong>Duration:</strong> {{ event_duration }}</p>
                    </div>
                    
                    <div class="actions">
                        <a href="{{ approve_url }}" class="btn btn-approve">✅ Approve Event</a>
                        <a href="{{ reject_url }}" class="btn btn-reject">❌ Reject Event</a>
                    </div>
                    
                    <p><small>These links will expire in 7 days. You can also manage events through the admin dashboard.</small></p>
                </div>
                
                <div class="footer">
                    <p>CreaLab Event Management System</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        """)
        
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
        
        subject = f"🔔 New Event Approval Required: {event_data.get('title', 'Event')}"
        
        return self.send_email(admin_email, subject, html_content, text_content)


# Global email service instance
email_service = EmailService()