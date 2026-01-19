from .. import register_action
import requests
import os
from django.core.cache import cache

@register_action("new_post")
def checker(area, now=None):
    """
    Check if an Instagram user has posted a new photo/video.
    Params: username (string)
    """
    try:
        api_key = os.environ.get("INSTAGRAM_RAPIDAPI_KEY")
        if not api_key:
            return False

        action_config = getattr(area, 'config_action', {}) or area.action_parameters or {}
        username = action_config.get('username')
        if not username:
            return False

        url = "https://instagram120.p.rapidapi.com/api/instagram/posts"
        headers = {
            "Content-Type": "application/json",
            "x-rapidapi-host": "instagram120.p.rapidapi.com",
            "x-rapidapi-key": api_key
        }
        payload = {"username": username}
        
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code != 200:
            return False
            
        data = response.json()
        
        items = []
        if 'data' in data and 'items' in data['data']:
            items = data['data']['items']
            
        if not items:
            return False
            
        latest_post = items[0]
        post_id = latest_post.get('id')
        caption = latest_post.get('caption', {}).get('text', '')
        shortcode = latest_post.get('shortcode', '')
        post_url = f"https://www.instagram.com/p/{shortcode}/" if shortcode else ""
        
        cache_key = f"instagram_last_post_{area.id}_{username}"
        last_id = cache.get(cache_key)
        
        if last_id is None:
            cache.set(cache_key, post_id, timeout=None)
            return False
            
        if post_id != last_id:
            cache.set(cache_key, post_id, timeout=None)
            
            if not hasattr(area, '_trigger_context'):
                area._trigger_context = {}
            
            area._trigger_context['username'] = username
            area._trigger_context['post_caption'] = caption
            area._trigger_context['post_url'] = post_url
            
            return True
            
        return False

    except Exception as e:
        print(f"Error in instagram_new_post: {e}")
        return False
