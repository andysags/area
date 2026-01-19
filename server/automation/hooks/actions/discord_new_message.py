from .. import register_action
import requests
import os
from django.core.cache import cache

@register_action("new_message")
def checker(area, now=None):
    """
    Check if a new message has been posted in the specified Discord channel.
    Params: channel_id (string)
    """
    try:
        # Use Bot Token from env
        token = os.environ.get("DISCORD_BOT_TOKEN")
        if not token:
            print("DISCORD_BOT_TOKEN not set")
            return False

        action_config = getattr(area, 'config_action', {}) or area.action_parameters or {}
        channel_id = action_config.get('channel_id')
        if not channel_id:
            return False
            
        url = f"https://discord.com/api/v10/channels/{channel_id}/messages"
        headers = {
            "Authorization": f"Bot {token}",
            "Content-Type": "application/json"
        }
        params = {"limit": 1}
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code != 200:
            # print(f"Discord API Error: {response.status_code} - {response.text}")
            return False
            
        data = response.json()
        if not data:
            return False
            
        latest_msg = data[0]
        msg_id = latest_msg['id']
        content = latest_msg['content']
        author = latest_msg['author']['username']
        author_bot = latest_msg['author'].get('bot', False)
        
        # Avoid triggering on own messages (if logic requires, but simple diff check is usually enough)
        
        cache_key = f"discord_last_message_{area.id}"
        last_id = cache.get(cache_key)
        
        if last_id != msg_id:
            cache.set(cache_key, msg_id, timeout=None)
            
            if not hasattr(area, '_trigger_context'):
                area._trigger_context = {}
            
            area._trigger_context['message_content'] = content
            area._trigger_context['author_name'] = author
            area._trigger_context['channel_id'] = channel_id
            area._trigger_context['message_id'] = msg_id
            
            return True
            
        return False

    except Exception as e:
        print(f"Error in discord_new_message: {e}")
        return False
