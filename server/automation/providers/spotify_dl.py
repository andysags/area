"""
Spotify Downloader Provider - Download songs from Spotify
Uses public API: https://rapidapi.com/spotifynow-spotifynow-default/api/spotify-downloader9
Note: This is separate from the Spotify Provider which uses OAuth for playlists.
"""
from .base import BaseProvider
from .registry import ProviderRegistry
import requests
import os

@ProviderRegistry.register
class SpotifyDownloaderProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return "spotify_dl"
    
    @property
    def display_name(self) -> str:
        return "Spotify Downloader"
    
    @property
    def icon_url(self) -> str:
        # Green icon to differentiate? or same
        return "https://cdn-icons-png.flaticon.com/512/2111/2111624.png"
    
    @property
    def requires_auth(self) -> bool:
        return False
    
    def get_actions(self):
        return []
    
    def get_reactions(self):
        return [
            {
                "name": "download_song",
                "display_name": "Télécharger Chanson",
                "description": "Download a song from Spotify by URL",
                "params": [
                    {
                        "name": "songId",
                        "type": "text",
                        "label": "Spotify Track URL/ID",
                        "required": True
                    }
                ],
                "handler": self.download_song
            }
        ]
    
    def download_song(self, params, context=None):
        song_id = params.get('songId')
        url = "https://spotify-downloader9.p.rapidapi.com/downloadSong"
        querystring = {"songId": song_id}
        headers = {
            'x-rapidapi-host': 'spotify-downloader9.p.rapidapi.com',
            'x-rapidapi-key': os.environ.get('SPOTIFY_RAPIDAPI_KEY')
        }

        try:
            response = requests.get(url, headers=headers, params=querystring)
            response.raise_for_status()
            return {"success": True, "data": response.json()}
        except Exception as e:
            return {"success": False, "error": str(e)}
