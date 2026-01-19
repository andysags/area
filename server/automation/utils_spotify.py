import os
import requests
from django.utils import timezone
from datetime import timedelta
from .models import UserService

def get_valid_spotify_token(user_service: UserService) -> str:
    """
    Returns a valid access token for the given UserService.
    Refreshes the token if it is expired or about to expire.
    """
    now = timezone.now()
    
    # Check if expired (or within 5 minutes of expiring)
    if user_service.expires_at and user_service.expires_at > now + timedelta(minutes=5):
        return user_service.get_access_token()
        
    # Valid refresh token needed
    refresh_token = user_service.get_refresh_token()
    if not refresh_token:
        # If no refresh token, return current access token and hope for the best
        # (This happens if we didn't get a refresh token initially, though Spotify usually sends one)
        return user_service.get_access_token()
        
    # Refresh logic
    client_id = os.environ.get('SPOTIFY_CLIENT_ID')
    client_secret = os.environ.get('SPOTIFY_CLIENT_SECRET')
    
    if not client_id or not client_secret:
        print("[ERROR] Spotify credentials missing in environment")
        return user_service.get_access_token()
        
    token_url = "https://accounts.spotify.com/api/token"
    data = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": client_id,
        "client_secret": client_secret
    }
    
    try:
        resp = requests.post(token_url, data=data)
        if resp.status_code == 200:
            token_data = resp.json()
            new_access_token = token_data.get('access_token')
            expires_in = token_data.get('expires_in', 3600)
            
            # Spotify might return a NEW refresh token, or might not.
            # If returned, update it. If not, keep the old one.
            new_refresh_token = token_data.get('refresh_token')
            
            if new_access_token:
                current_refresh = new_refresh_token if new_refresh_token else refresh_token
                user_service.set_tokens(new_access_token, current_refresh)
                user_service.expires_at = timezone.now() + timedelta(seconds=expires_in)
                user_service.save()
                return new_access_token
                
        else:
            print(f"[ERROR] Failed to refresh Spotify token: {resp.status_code} {resp.text}")
            
    except Exception as e:
        print(f"[ERROR] Exception refreshing Spotify token: {e}")
        
    # Fallback to existing token
    return user_service.get_access_token()
