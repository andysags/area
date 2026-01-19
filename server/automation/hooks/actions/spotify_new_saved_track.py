from .. import register_action
from automation.models import UserService, Service, Area
from automation.utils_spotify import get_valid_spotify_token
import requests
from django.core.cache import cache


@register_action("new_saved_track")
def checker(area, now=None):
    """
    Check if user has saved a new track on Spotify.
    Uses polling with cache to track last seen track.
    Returns True if new track detected, and stores track_uri in context.
    """
    try:
        # Get user's Spotify token
        service = Service.objects.get(name='spotify')
        user_service = UserService.objects.get(user=area.user, service=service)
        
        # Use valid token
        access_token = get_valid_spotify_token(user_service)
        
        if not access_token:
            return False
        
        # Fetch user's saved tracks (most recent first)
        url = "https://api.spotify.com/v1/me/tracks"
        headers = {"Authorization": f"Bearer {access_token}"}
        params = {"limit": 1}  # Only get the most recent track
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code != 200:
            return False
        
        data = response.json()
        items = data.get("items", [])
        
        if not items:
            return False
        
        # Get the most recent saved track
        latest_track = items[0]
        track_uri = latest_track["track"]["uri"]
        track_name = latest_track["track"]["name"]
        artist_name = latest_track["track"]["artists"][0]["name"] if latest_track["track"]["artists"] else "Unknown"
        
        # Cache key unique to this area
        cache_key = f"spotify_last_track_{area.id}"
        last_seen_track = cache.get(cache_key)
        
        # If this is a new track (different from last seen)
        if last_seen_track != track_uri:
            # Update cache
            cache.set(cache_key, track_uri, timeout=None)  # Never expire
            
            # Store track info in area's context for the reaction to use
            # We'll use a temporary attribute (not saved to DB)
            if not hasattr(area, '_trigger_context'):
                area._trigger_context = {}
            area._trigger_context['track_uri'] = track_uri
            area._trigger_context['track_name'] = track_name
            area._trigger_context['artist_name'] = artist_name
            
            return True
        
        return False
        
    except Service.DoesNotExist:
        return False
    except UserService.DoesNotExist:
        return False
    except Exception as e:
        print(f"Error in new_saved_track checker: {e}")
        return False
