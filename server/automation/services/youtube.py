import requests
import os
import json
from automation.interfaces import IService, IReaction

class YouTubeService(IService):
    slug = "youtube"
    
    HEADERS = {
        'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com',
        'x-rapidapi-key': os.environ.get('YOUTUBE_RAPIDAPI_KEY')
    }

    @property
    def slug(self) -> str:
        return "youtube"

class GetMp3LinkReaction(IReaction):
    slug = "get_mp3_link"
    
    @property
    def slug(self) -> str:
        return "get_mp3_link"

    def execute(self, params: dict) -> None:
        """
        Execute the reaction to get MP3 download link.
        params: {
            "video_id": "UxxajLWwzqY"
        }
        """
        video_id = params.get('video_id')
        if not video_id:
            print("[YouTube] Error: 'video_id' parameter is required.")
            return

        url = "https://youtube-mp36.p.rapidapi.com/dl"
        querystring = {"id": video_id}

        try:
            print(f"[YouTube] Fetching MP3 link for video ID: '{video_id}'...")
            response = requests.get(url, headers=YouTubeService.HEADERS, params=querystring)
            response.raise_for_status()
            
            result = response.json()
            
            print(f"[YouTube] Success! Result:\n{json.dumps(result, indent=2)}")
            
            if 'link' in result:
                print(f"[YouTube] Download Link: {result['link']}")
            elif 'link' in result.get('data', {}): # Some APIs nest it
                 print(f"[YouTube] Download Link: {result['data']['link']}")

        except Exception as e:
            print(f"[YouTube] Error: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Response: {e.response.text}")
