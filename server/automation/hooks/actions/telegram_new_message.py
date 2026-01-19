from .. import register_action
import requests
import os
from django.core.cache import cache

@register_action("new_message")
def checker(area, now=None):
    """
    Check if a new message has been received in the Telegram Bot's chat.
    Params: chat_id (string)
    """
    try:
        token = os.environ.get("TELEGRAM_BOT_TOKEN")
        if not token:
            return False

        action_config = getattr(area, 'config_action', {}) or area.action_parameters or {}
        target_chat_id = action_config.get('chat_id')
        if not target_chat_id:
            return False
            
        # Poll updates (last 10)
        # We don't use global offset commit to avoid interfering with other Areas
        url = f"https://api.telegram.org/bot{token}/getUpdates"
        params = {"offset": -10} 
        
        response = requests.get(url, params=params)
        if response.status_code != 200:
            return False
            
        data = response.json()
        if not data.get("ok"):
            return False
            
        updates = data.get("result", [])
        if not updates:
            return False
            
        # Filter for the specific chat_id
        # Telegram chat_id is int, but we store as string. Convert for comparison.
        try:
            target_chat_id_int = int(target_chat_id)
        except:
            return False
            
        relevant_updates = []
        for u in updates:
            msg = u.get("message", {})
            chat = msg.get("chat", {})
            if chat.get("id") == target_chat_id_int:
                relevant_updates.append(u)
                
        if not relevant_updates:
            return False
            
        # Get latest
        latest_update = relevant_updates[-1]
        update_id = latest_update['update_id']
        message = latest_update.get('message', {})
        text = message.get('text', '')
        sender = message.get('from', {}).get('first_name', 'Unknown')
        
        cache_key = f"telegram_last_update_{area.id}"
        last_id = cache.get(cache_key)
        
        # If no cache, we might not want to trigger on old messages immediately
        # But for logic simplicity, we trigger if ID matches what we see as "newest" compared to nothing?
        # Better: if last_id is None, set it and return False (bootstrap).
        if last_id is None:
            cache.set(cache_key, update_id, timeout=None)
            return False
            
        if update_id > last_id:
            cache.set(cache_key, update_id, timeout=None)
            
            if not hasattr(area, '_trigger_context'):
                area._trigger_context = {}
            
            area._trigger_context['message_text'] = text
            area._trigger_context['sender_name'] = sender
            area._trigger_context['chat_id'] = str(target_chat_id)
            
            return True
            
        return False

    except Exception as e:
        print(f"Error in telegram_new_message: {e}")
        return False
