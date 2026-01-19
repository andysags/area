from .. import register_reaction
from automation.models import UserService, Service
import requests
import base64
from email.mime.text import MIMEText

@register_reaction("send_email")
def executor(area, context=None):
    """
    Send an email via Gmail.
    Params: to (string), subject (string), body (string)
    """
    try:
        from accounts.models import OAuthAccount
        oauth_account = OAuthAccount.objects.filter(user=area.user, provider='google').first()
        
        if not oauth_account:
            print("No Google OAuth account found")
            return
            
        access_token = oauth_account.access_token

        reaction_config = getattr(area, 'config_reaction', {}) or area.reaction_parameters or {}
        
        to_email = reaction_config.get('to')
        subject_template = reaction_config.get('subject', 'Message from Area')
        body_template = reaction_config.get('body', 'Sent by Area Automation')
        
        if not to_email:
            print("No recipient (to) specified for gmail_send_email")
            return

        # Variable Injection
        ctx = getattr(area, '_trigger_context', {}) or {}
        
        def format_string(template, ctx):
            for key, val in ctx.items():
                template = template.replace(f"{{{{ {key} }}}}", str(val))
                template = template.replace(f"{{{key}}}", str(val))
            return template

        final_subject = format_string(subject_template, ctx)
        final_body = format_string(body_template, ctx)
        
        # Create MIME Message
        message = MIMEText(final_body)
        message['to'] = to_email
        message['subject'] = final_subject
        
        # Encode base64url
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
        
        url = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        payload = {"raw": raw_message}
        
        res = requests.post(url, headers=headers, json=payload)
        
        if res.status_code == 200:
            print(f"Email sent successfully: {res.json().get('id')}")
        else:
            print(f"Failed to send email: {res.text}")

    except Exception as e:
        print(f"Error in gmail_send_email: {e}")
