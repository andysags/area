import requests
import os
import json
from automation.interfaces import IService, IReaction

class InstagramService(IService):
    slug = "instagram"
    
    HEADERS = {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'instagram120.p.rapidapi.com',
        'x-rapidapi-key': os.environ.get('INSTAGRAM_RAPIDAPI_KEY')
    }

    @property
    def slug(self) -> str:
        return "instagram"

class GetUserPostsReaction(IReaction):
    slug = "get_user_posts"
    
    @property
    def slug(self) -> str:
        return "get_user_posts"

    def execute(self, params: dict) -> None:
        """
        Execute the reaction to get user posts.
        params: {
            "username": "keke",
            "maxId": "" (optional)
        }
        """
        username = params.get('username')
        if not username:
            print("[Instagram] Error: 'username' parameter is required.")
            return

        payload = {
            "username": username,
            "maxId": params.get('maxId', '')
        }
            
        url = "https://instagram120.p.rapidapi.com/api/instagram/posts"

        try:
            print(f"[Instagram] Fetching posts for user: '{username}'...")
            response = requests.post(url, json=payload, headers=InstagramService.HEADERS)
            response.raise_for_status()
            
            result = response.json()
            print(f"[Instagram] Success! Result:\n{json.dumps(result, indent=2)}")
            
            # Extract useful info if available
            if 'data' in result and 'items' in result['data']:
                post_count = len(result['data']['items'])
                print(f"[Instagram] Retrieved {post_count} posts")

        except Exception as e:
            print(f"[Instagram] Error: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Response: {e.response.text}")
