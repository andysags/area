from .. import register_reaction
from automation.models import UserService, Service
import requests
from accounts.models import OAuthAccount

@register_reaction("create_issue")
def executor(area, context=None):
    """
    Create a new issue in the specified repository.
    Params: repository (string), title (string), body (string)
    """
    try:
        # Get Auth
        oauth_account = OAuthAccount.objects.filter(user=area.user, provider='github').first()
        if not oauth_account:
            print("No GitHub OAuth account found for user")
            return
            
        access_token = oauth_account.access_token

        # Config
        reaction_config = getattr(area, 'config_reaction', {}) or area.reaction_parameters or {}
        
        repo = reaction_config.get('repository')
        title_template = reaction_config.get('title', 'New Issue from Area')
        body_template = reaction_config.get('body', 'Created by Area Automation')
        
        if not repo:
            print("No repository specified for create_issue")
            return

        # Variable Injection
        # Context comes from the trigger. area._trigger_context might be passed as `context` argument by worker?
        # Let's check worker.py.
        # worker.py calls: reaction_instance.execute(area.reaction_parameters)
        # It DOES NOT pass the trigger context explicitly in the `execute` call signature in worker.py lines 53-54:
        # `reaction_instance.execute(area.reaction_parameters)`
        # But wait, in the action step: `area._trigger_context = ...`
        # Since `area` object is the same, we can access `area._trigger_context` if the worker doesn't reload the object.
        # The worker executes:
        # process_area(area) -> action.check_trigger -> sets area._trigger_context
        # if triggered -> reaction.execute(params)
        # So `area` should still have `_trigger_context`.
        
        ctx = getattr(area, '_trigger_context', {}) or {}
        
        def format_string(template, ctx):
            for key, val in ctx.items():
                template = template.replace(f"{{{{ {key} }}}}", str(val)) # {{ key }}
                template = template.replace(f"{{{key}}}", str(val))       # {key}
            return template

        final_title = format_string(title_template, ctx)
        final_body = format_string(body_template, ctx)
        
        # API Call
        url = f"https://api.github.com/repos/{repo}/issues"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        payload = {
            "title": final_title,
            "body": final_body
        }
        
        res = requests.post(url, headers=headers, json=payload)
        
        if res.status_code == 201:
            print(f"Issue created successfully: {res.json().get('html_url')}")
        else:
            print(f"Failed to create issue: {res.text}")

    except Exception as e:
        print(f"Error in github_create_issue: {e}")
