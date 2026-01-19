"""
Anime Provider - Anime discovery and tracking
Uses public API: https://api.jikan.moe/v4/ (MyAnimeList unofficial API)
"""
from .base import BaseProvider
from .registry import ProviderRegistry
import requests
from datetime import datetime


@ProviderRegistry.register
class AnimeProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return "anime"
    
    @property
    def display_name(self) -> str:
        return "Anime"
    
    @property
    def icon_url(self) -> str:
        return "https://cdn-icons-png.flaticon.com/512/3976/3976625.png"
    
    @property
    def requires_auth(self) -> bool:
        return False
    
    def get_actions(self):
        return [
            {
                "name": "new_anime_airing",
                "display_name": "Nouvel Épisode Diffusé",
                "description": "Triggers when a new episode of a tracked anime airs",
                "params": [
                    {
                        "name": "anime_id",
                        "type": "text",
                        "label": "Anime ID (from MyAnimeList)",
                        "required": True,
                        "placeholder": "e.g., 5114 (Fullmetal Alchemist)"
                    }
                ],
                "handler": self.check_new_episode
            }
        ]
    
    def get_reactions(self):
        return [
            {
                "name": "search_anime",
                "display_name": "Rechercher un Anime",
                "description": "Search for anime by title or genre",
                "params": [
                    {
                        "name": "query",
                        "type": "text",
                        "label": "Search Query",
                        "required": True,
                        "placeholder": "e.g., Naruto"
                    },
                    {
                        "name": "limit",
                        "type": "number",
                        "label": "Max Results",
                        "required": False,
                        "default": 10
                    }
                ],
                "handler": self.search_anime
            },
            {
                "name": "get_anime_details",
                "display_name": "Obtenir Détails Anime",
                "description": "Get detailed information about an anime",
                "params": [
                    {
                        "name": "anime_id",
                        "type": "text",
                        "label": "Anime ID",
                        "required": True
                    }
                ],
                "handler": self.get_anime_details
            }
        ]
    
    def check_new_episode(self, params, context=None):
        """Check if a new episode has aired"""
        anime_id = params.get("anime_id")
        area_id = context.get("area_id") if context else None
        
        try:
            url = f"https://api.jikan.moe/v4/anime/{anime_id}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json().get("data", {})
            current_episodes = data.get("episodes", 0)
            
            # Get saved state
            if area_id:
                from automation.models import Area
                area = Area.objects.get(id=area_id)
                last_episode_count = area.trigger_state.get("last_episode_count", 0)
                
                # Check if new episode
                if current_episodes > last_episode_count:
                    # Update state
                    area.trigger_state["last_episode_count"] = current_episodes
                    area.save()
                    
                    return {
                        "triggered": True,
                        "anime_title": data.get("title", "Unknown"),
                        "new_episode": current_episodes,
                        "aired_date": data.get("aired", {}).get("from", "")
                    }
                else:
                    # No new episode, just update state
                    if last_episode_count == 0:
                        area.trigger_state["last_episode_count"] = current_episodes
                        area.save()
                    return {"triggered": False}
            
            return {"triggered": False, "error": "No area context"}
            
        except Exception as e:
            return {"triggered": False, "error": str(e)}
    
    def search_anime(self, params, context=None):
        """Search for anime"""
        query = params.get("query", "")
        limit = params.get("limit", 10)
        
        try:
            url = f"https://api.jikan.moe/v4/anime?q={query}&limit={limit}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json().get("data", [])
            results = []
            
            for anime in data:
                results.append({
                    "id": anime.get("mal_id"),
                    "title": anime.get("title"),
                    "score": anime.get("score"),
                    "episodes": anime.get("episodes"),
                    "status": anime.get("status"),
                    "url": anime.get("url")
                })
            
            return {
                "success": True,
                "count": len(results),
                "results": results
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_anime_details(self, params, context=None):
        """Get anime details"""
        anime_id = params.get("anime_id")
        
        try:
            url = f"https://api.jikan.moe/v4/anime/{anime_id}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json().get("data", {})
            
            return {
                "success": True,
                "id": data.get("mal_id"),
                "title": data.get("title"),
                "synopsis": data.get("synopsis"),
                "score": data.get("score"),
                "episodes": data.get("episodes"),
                "status": data.get("status"),
                "aired": data.get("aired", {}).get("string", ""),
                "genres": [g.get("name") for g in data.get("genres", [])],
                "url": data.get("url")
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
