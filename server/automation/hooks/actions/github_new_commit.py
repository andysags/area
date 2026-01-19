from .. import register_action
from automation.models import UserService, Service
import requests
from django.core.cache import cache

@register_action("new_commit")
def checker(area, now=None):
    """
    Check if a new commit has been pushed to the specified repository.
    Params: repository (string) e.g., "owner/repo"
    """
    try:
        # Get user's GitHub service
        service = Service.objects.get(name='github')
        user_service = UserService.objects.get(user=area.user, service=service)
        
        # Get access token from OAuth account
        # GitHub provider saves 'access_token' in default OAuth logic
        # We need to find the OAuthAccount linked to this user and provider 'github'
        # But wait, UserService doesn't directly link to OAuthAccount in the current model?
        # Let's check how Spotify did it in utils_spotify.py or just use user.oauth_accounts.
        
        # In current model: User -> OAuthAccount (provider='github')
        # We can query OAuthAccount directly.
        from accounts.models import OAuthAccount
        oauth_account = OAuthAccount.objects.filter(user=area.user, provider='github').first()
        
        if not oauth_account:
            return False
            
        access_token = oauth_account.access_token # Assuming plain token for now (GitHub tokens don't expire quickly unless configured)

        # Config
        config = area.action_parameters or {} # Legacy field name, or use area.config_action
        # The field 'config_action' was added recently. Let's try config_action first, fallback to parameters.
        action_config = getattr(area, 'config_action', {}) or area.action_parameters or {}
        
        repo = action_config.get('repository')
        if not repo:
            return False
            
        # Call GitHub API
        url = f"https://api.github.com/repos/{repo}/commits"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        params = {"per_page": 1}
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code != 200:
            return False
            
        data = response.json()
        if not data:
            return False
            
        latest_commit = data[0]
        sha = latest_commit['sha']
        message = latest_commit['commit']['message']
        author = latest_commit['commit']['author']['name']
        
        # Cache check
        cache_key = f"github_last_commit_{area.id}"
        last_sha = cache.get(cache_key)
        
        if last_sha != sha:
            cache.set(cache_key, sha, timeout=None)
            
            # Store context
            if not hasattr(area, '_trigger_context'):
                area._trigger_context = {}
            
            area._trigger_context['commit_sha'] = sha
            area._trigger_context['commit_message'] = message
            area._trigger_context['author_name'] = author
            area._trigger_context['repository'] = repo
            
            return True
            
        return False

    except Exception as e:
        print(f"Error in github_new_commit: {e}")
        return False
