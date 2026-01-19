from .. import register_reaction
import requests
import os
from accounts.models import OAuthAccount

@register_reaction("post_tweet")
def executor(area, context=None):
    """
    Post a tweet via Twitter API V2.
    Params: text (string)
    """
    try:
        # Check OAuth
        oauth_account = OAuthAccount.objects.filter(user=area.user, provider='twitter').first()
        if not oauth_account:
            print("No Twitter OAuth account found")
            return
            
        access_token = oauth_account.access_token

        reaction_config = getattr(area, 'config_reaction', {}) or area.reaction_parameters or {}
        text_template = reaction_config.get('text', 'Hello from Area!')
        
        # Variable Injection
        ctx = getattr(area, '_trigger_context', {}) or {}
        
        def format_string(template, ctx):
            for key, val in ctx.items():
                template = template.replace(f"{{{{ {key} }}}}", str(val))
                template = template.replace(f"{{{key}}}", str(val))
            return template

        final_text = format_string(text_template, ctx)
        
        # Twitter API V2 Post Tweet
        url = "https://api.twitter.com/2/tweets"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        payload = {"text": final_text}
        
        res = requests.post(url, headers=headers, json=payload)
        
        if res.status_code == 201:
            print(f"Tweet posted: {res.json().get('data', {}).get('id')}")
        else:
            print(f"Failed to post tweet: {res.text}")

    except Exception as e:
        print(f"Error in twitter_post_tweet: {e}")
