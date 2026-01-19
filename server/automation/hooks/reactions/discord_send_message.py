from .. import register_reaction
import requests
import os

@register_reaction("send_message")
def executor(area, context=None):
    """
    Post a message to a Discord channel.
    Params: channel_id (string), content (string)
    """
    try:
        token = os.environ.get("DISCORD_BOT_TOKEN")
        if not token:
            print("DISCORD_BOT_TOKEN not set")
            return

        reaction_config = getattr(area, 'config_reaction', {}) or area.reaction_parameters or {}
        
        channel_id = reaction_config.get('channel_id')
        content_template = reaction_config.get('content', 'Hello from Area!')
        
        if not channel_id:
            print("No channel_id specified for discord_send_message")
            return

        # Variable Injection
        ctx = getattr(area, '_trigger_context', {}) or {}
        
        def format_string(template, ctx):
            for key, val in ctx.items():
                template = template.replace(f"{{{{ {key} }}}}", str(val))
                template = template.replace(f"{{{key}}}", str(val))
            return template

        final_content = format_string(content_template, ctx)
        
        url = f"https://discord.com/api/v10/channels/{channel_id}/messages"
        headers = {
            "Authorization": f"Bot {token}",
            "Content-Type": "application/json"
        }
        payload = {
            "content": final_content
        }
        
        res = requests.post(url, headers=headers, json=payload)
        
        if res.status_code in [200, 201]:
            print(f"Discord message sent: {res.json().get('id')}")
        else:
            print(f"Failed to send Discord message: {res.text}")

    except Exception as e:
        print(f"Error in discord_send_message: {e}")
