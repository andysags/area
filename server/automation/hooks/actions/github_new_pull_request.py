from .. import register_action
from automation.models import UserService, Service
import requests
from django.core.cache import cache

@register_action("new_pull_request")
def checker(area, now=None):
    """
    Check if a new pull request has been created in the specified repository.
    Params: repository (string)
    """
    try:
        service = Service.objects.get(name='github')
        from accounts.models import OAuthAccount
        oauth_account = OAuthAccount.objects.filter(user=area.user, provider='github').first()
        
        if not oauth_account:
            return False
            
        access_token = oauth_account.access_token

        action_config = getattr(area, 'config_action', {}) or area.action_parameters or {}
        repo = action_config.get('repository')
        if not repo:
            return False
            
        url = f"https://api.github.com/repos/{repo}/pulls"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        params = {"per_page": 1, "state": "open", "sort": "created", "direction": "desc"}
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code != 200:
            return False
            
        data = response.json()
        if not data:
            return False
            
        latest_pr = data[0]
        pr_id = str(latest_pr['id'])
        pr_number = latest_pr['number']
        title = latest_pr['title']
        user = latest_pr['user']['login']
        url = latest_pr['html_url']
        
        cache_key = f"github_last_pr_{area.id}"
        last_id = cache.get(cache_key)
        
        if last_id != pr_id:
            cache.set(cache_key, pr_id, timeout=None)
            
            if not hasattr(area, '_trigger_context'):
                area._trigger_context = {}
            
            area._trigger_context['pr_id'] = pr_id
            area._trigger_context['pr_number'] = pr_number
            area._trigger_context['pr_title'] = title
            area._trigger_context['pr_author'] = user
            area._trigger_context['pr_url'] = url
            area._trigger_context['repository'] = repo
            
            return True
            
        return False

    except Exception as e:
        print(f"Error in github_new_pull_request: {e}")
        return False
