"""
Games Provider - Game news and announcements
Uses public API: https://rapidapi.com/digimonk/api/games-details
"""
from .base import BaseProvider
from .registry import ProviderRegistry
import requests
import os

@ProviderRegistry.register
class GamesProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return "games"
    
    @property
    def display_name(self) -> str:
        return "Games Details"
    
    @property
    def icon_url(self) -> str:
        return "https://cdn-icons-png.flaticon.com/512/686/686589.png"
    
    @property
    def requires_auth(self) -> bool:
        return False
    
    def get_actions(self):
        return []
    
    def get_reactions(self):
        return [
            {
                "name": "get_game_news",
                "display_name": "Obtenir Actualités Jeu",
                "description": "Retrieve news and announcements for a specific game",
                "params": [
                    {
                        "name": "game_id",
                        "type": "text",
                        "label": "Game ID",
                        "required": True
                    },
                    {
                        "name": "limit",
                        "type": "number",
                        "label": "Limit",
                        "default": 10
                    }
                ],
                "handler": self.get_game_news
            }
        ]
    
    def get_game_news(self, params, context=None):
        game_id = params.get('game_id')
        limit = params.get('limit', 10)
        offset = params.get('offset', 0)
        
        url = f"https://games-details.p.rapidapi.com/news/announcements/{game_id}"
        querystring = {"limit": limit, "offset": offset}
        headers = {
            'x-rapidapi-host': 'games-details.p.rapidapi.com',
            'x-rapidapi-key': os.environ.get('GAMES_RAPIDAPI_KEY')
        }

        try:
            response = requests.get(url, headers=headers, params=querystring)
            response.raise_for_status()
            return {"success": True, "data": response.json()}
        except Exception as e:
            return {"success": False, "error": str(e)}
