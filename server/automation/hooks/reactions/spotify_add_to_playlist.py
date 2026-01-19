from .. import register_reaction
from automation.models import UserService, Service
from automation.utils_spotify import get_valid_spotify_token
import requests


@register_reaction("add_to_playlist")
def executor(area, context=None):
    """
    Add a track to a Spotify playlist.
    Requires: playlist_id parameter in config_reaction
    Expects: track_uri in context (from trigger action)
    """
    cfg = area.config_reaction or {}
    playlist_id = cfg.get("playlist_id")
    
    if not playlist_id:
        return {"ok": False, "detail": "Missing playlist_id parameter"}
    
    # Get track URI from context (passed from trigger action)
    ctx = context or {}
    track_uri = ctx.get("track_uri")
    
    if not track_uri:
        return {"ok": False, "detail": "No track_uri provided by trigger action"}
    
    try:
        # Get user's Spotify token
        service = Service.objects.get(name='spotify')
        user_service = UserService.objects.get(user=area.user, service=service)
        
        # Use valid token
        access_token = get_valid_spotify_token(user_service)
        
        if not access_token:
            return {"ok": False, "detail": "Spotify not connected"}
        
        # Add track to playlist via Spotify API
        url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        data = {
            "uris": [track_uri]
        }
        
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code == 201:
            return {
                "ok": True,
                "detail": f"Track {track_uri} added to playlist {playlist_id}"
            }
        elif response.status_code == 401:
            return {
                "ok": False,
                "detail": "Spotify token expired, please reconnect"
            }
        else:
            return {
                "ok": False,
                "detail": f"Spotify API error {response.status_code}: {response.text[:200]}"
            }
            
    except Service.DoesNotExist:
        return {"ok": False, "detail": "Spotify service not found"}
    except UserService.DoesNotExist:
        return {"ok": False, "detail": "Spotify not connected for this user"}
    except Exception as e:
        return {"ok": False, "detail": f"Error: {str(e)}"}
