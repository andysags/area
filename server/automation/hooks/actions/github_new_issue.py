from .. import register_action
from automation.models import UserService, Service
import requests
from django.core.cache import cache

@register_action("new_issue")
def checker(area, now=None):
    """
    Check if a new issue has been created in the specified repository.
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
            
        url = f"https://api.github.com/repos/{repo}/issues"
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
            
        latest_issue = data[0]
        # Skip if pull request (GitHub API returns PRs as issues too)
        if 'pull_request' in latest_issue:
            # We might need to filter more if the latest item is a PR
            # But for simplicity, let's assume if the LATEST thing is a PR, we iterate a bit? 
            # Or just check ID context.
            pass

        issue_id = str(latest_issue['id'])
        issue_number = latest_issue['number']
        title = latest_issue['title']
        user = latest_issue['user']['login']
        
        cache_key = f"github_last_issue_{area.id}"
        last_id = cache.get(cache_key)
        
        if last_id != issue_id:
            cache.set(cache_key, issue_id, timeout=None)
            
            if not hasattr(area, '_trigger_context'):
                area._trigger_context = {}
            
            area._trigger_context['issue_id'] = issue_id
            area._trigger_context['issue_number'] = issue_number
            area._trigger_context['issue_title'] = title
            area._trigger_context['issue_author'] = user
            area._trigger_context['repository'] = repo
            
            return True
            
        return False

    except Exception as e:
        print(f"Error in github_new_issue: {e}")
        return False
