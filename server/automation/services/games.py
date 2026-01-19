import requests
import os
import json
from automation.interfaces import IService, IReaction

class GamesService(IService):
    slug = "games"
    
    HEADERS = {
        'x-rapidapi-host': 'games-details.p.rapidapi.com',
        'x-rapidapi-key': os.environ.get('GAMES_RAPIDAPI_KEY')
    }

    @property
    def slug(self) -> str:
        return "games"

class GetGameNewsReaction(IReaction):
    slug = "get_game_news"
    
    @property
    def slug(self) -> str:
        return "get_game_news"

    def execute(self, params: dict) -> None:
        """
        Execute the reaction to get game news/announcements.
        params: {
            "game_id": "3240220",
            "limit": 10,
            "offset": 0
        }
        """
        game_id = params.get('game_id')
        if not game_id:
            print("[Games] Error: 'game_id' parameter is required.")
            return

        limit = params.get('limit', 10)
        offset = params.get('offset', 0)
        
        url = f"https://games-details.p.rapidapi.com/news/announcements/{game_id}"
        querystring = {"limit": limit, "offset": offset}

        try:
            print(f"[Games] Fetching news for game ID: '{game_id}'...")
            response = requests.get(url, headers=GamesService.HEADERS, params=querystring)
            response.raise_for_status()
            
            result = response.json()
            print(f"[Games] Success! Result:\n{json.dumps(result, indent=2)}")
            
            # Extract useful info if available
            if isinstance(result, list):
                print(f"[Games] Retrieved {len(result)} news items")

        except Exception as e:
            print(f"[Games] Error: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Response: {e.response.text}")
