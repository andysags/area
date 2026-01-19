from .. import register_action
from automation.models import UserService, Service
import requests
from django.core.cache import cache

@register_action("new_email")
def checker(area, now=None):
    """
    Check if a new email has been received in Gmail Inbox.
    """
    try:
        from accounts.models import OAuthAccount
        oauth_account = OAuthAccount.objects.filter(user=area.user, provider='google').first()
        
        if not oauth_account:
            return False
            
        access_token = oauth_account.access_token

        # 1. List Messages (Inbox)
        url_list = "https://gmail.googleapis.com/gmail/v1/users/me/messages"
        headers = {"Authorization": f"Bearer {access_token}"}
        params = {"labelIds": "INBOX", "maxResults": 1}
        
        res_list = requests.get(url_list, headers=headers, params=params)
        
        if res_list.status_code != 200:
            return False
            
        data = res_list.json()
        messages = data.get('messages', [])
        
        if not messages:
            return False
            
        latest_msg = messages[0]
        msg_id = latest_msg['id']
        
        cache_key = f"gmail_last_email_{area.id}"
        last_id = cache.get(cache_key)
        
        if last_id != msg_id:
            # New email found! Fetch details
            url_detail = f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{msg_id}"
            res_detail = requests.get(url_detail, headers=headers)
            
            if res_detail.status_code == 200:
                detail = res_detail.json()
                snippet = detail.get('snippet', '')
                payload = detail.get('payload', {})
                headers_list = payload.get('headers', [])
                
                subject = next((h['value'] for h in headers_list if h['name'] == 'Subject'), 'No Subject')
                sender = next((h['value'] for h in headers_list if h['name'] == 'From'), 'Unknown')
                
                cache.set(cache_key, msg_id, timeout=None)
                
                if not hasattr(area, '_trigger_context'):
                    area._trigger_context = {}
                
                area._trigger_context['email_subject'] = subject
                area._trigger_context['email_from'] = sender
                area._trigger_context['email_snippet'] = snippet
                area._trigger_context['email_id'] = msg_id
                
                return True
            
        return False

    except Exception as e:
        print(f"Error in gmail_new_email: {e}")
        return False
