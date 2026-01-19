import requests
import os
import json
from automation.interfaces import IService, IReaction

class HoroscopeService(IService):
    slug = "horoscope"
    
    HEADERS = {
        'x-rapidapi-host': 'horoscopes-ai.p.rapidapi.com',
        'x-rapidapi-key': os.environ.get('HOROSCOPE_RAPIDAPI_KEY')
    }

    @property
    def slug(self) -> str:
        return "horoscope"

class GetHoroscopeReaction(IReaction):
    slug = "get_horoscope"
    
    @property
    def slug(self) -> str:
        return "get_horoscope"

    def execute(self, params: dict) -> None:
        """
        Execute the reaction to get horoscope.
        params: {
            "sign": "aries",
            "period": "today",
            "language": "en"
        }
        """
        sign = params.get('sign')
        if not sign:
            print("[Horoscope] Error: 'sign' parameter is required.")
            return

        period = params.get('period', 'today')
        language = params.get('language', 'en')
        
        url = f"https://horoscopes-ai.p.rapidapi.com/get_horoscope/{sign}/{period}/general/{language}"

        try:
            print(f"[Horoscope] Fetching horoscope for {sign} ({period})...")
            response = requests.get(url, headers=HoroscopeService.HEADERS)
            response.raise_for_status()
            
            result = response.json()
            print(f"[Horoscope] Success! Result:\n{json.dumps(result, indent=2)}")

        except Exception as e:
            print(f"[Horoscope] Error: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Response: {e.response.text}")
