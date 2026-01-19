from .. import register_reaction
import requests
import os

@register_reaction("send_message")
def executor(area, context=None):
    """
    Send a message via Telegram Bot.
    Params: chat_id (string), text (string)
    """
    try:
        token = os.environ.get("TELEGRAM_BOT_TOKEN")
        if not token:
            print("TELEGRAM_BOT_TOKEN not set")
            return

        reaction_config = getattr(area, 'config_reaction', {}) or area.reaction_parameters or {}
        
        chat_id = reaction_config.get('chat_id')
        text_template = reaction_config.get('text', 'Hello from Area')
        
        if not chat_id:
            print("No chat_id specified for telegram_send_message")
            return

        # Variable Injection
        ctx = getattr(area, '_trigger_context', {}) or {}
        
        def format_string(template, ctx):
            for key, val in ctx.items():
                template = template.replace(f"{{{{ {key} }}}}", str(val))
                template = template.replace(f"{{{key}}}", str(val))
            return template

        final_text = format_string(text_template, ctx)
        
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": final_text
        }
        
        res = requests.post(url, json=payload)
        
        if res.status_code == 200:
            print(f"Telegram message sent: {res.json().get('result', {}).get('message_id')}")
        else:
            print(f"Failed to send Telegram message: {res.text}")

    except Exception as e:
        print(f"Error in telegram_send_message: {e}")
