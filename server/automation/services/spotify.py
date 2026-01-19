import requests
import os
import json
from automation.interfaces import IService, IReaction

class SpotifyService(IService):
    slug = "spotify"
    
    HEADERS = {
        'x-rapidapi-host': 'spotify-downloader9.p.rapidapi.com',
        'x-rapidapi-key': os.environ.get('SPOTIFY_RAPIDAPI_KEY')
    }

    @property
    def slug(self) -> str:
        return "spotify"

class DownloadSongReaction(IReaction):
    slug = "download_song"
    
    @property
    def slug(self) -> str:
        return "download_song"

    def execute(self, params: dict) -> None:
        """
        Execute the reaction to download a song.
        params: {
            "songId": "https://open.spotify.com/track/7jT3LcNj4XPYOlbNkPWNhU"
        }
        """
        song_id = params.get('songId')
        if not song_id:
            print("[Spotify] Error: 'songId' parameter is required.")
            return

        url = "https://spotify-downloader9.p.rapidapi.com/downloadSong"
        querystring = {"songId": song_id}

        try:
            print(f"[Spotify] Downloading song: '{song_id}'...")
            response = requests.get(url, headers=SpotifyService.HEADERS, params=querystring)
            response.raise_for_status()
            
            result = response.json()
            print(f"[Spotify] Success! Result:\n{json.dumps(result, indent=2)}")
            
            # Extract download link if available
            if 'data' in result and 'downloadLink' in result['data']:
                print(f"[Spotify] Download Link: {result['data']['downloadLink']}")
            elif 'downloadLink' in result:
                print(f"[Spotify] Download Link: {result['downloadLink']}")

        except Exception as e:
            print(f"[Spotify] Error: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Response: {e.response.text}")
