"""
Horoscope Provider - Daily horoscope for all zodiac signs
Uses public API: https://horoscope-app-api.vercel.app/
"""
from .base import BaseProvider
from .registry import ProviderRegistry
import requests


@ProviderRegistry.register
class HoroscopeProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return "horoscope"
    
    @property
    def display_name(self) -> str:
        return "Horoscope"
    
    @property
    def icon_url(self) -> str:
        return "https://cdn-icons-png.flaticon.com/512/3596/3596095.png"
    
    @property
    def requires_auth(self) -> bool:
        return False
    
    def get_actions(self):
        """No triggers for horoscope - it's a reaction-only service"""
        return []
    
    def get_reactions(self):
        return [
            {
                "name": "get_daily_horoscope",
                "display_name": "Obtenir l'Horoscope du Jour",
                "description": "Get today's horoscope for a zodiac sign",
                "params": [
                    {
                        "name": "sign",
                        "type": "select",
                        "label": "Zodiac Sign",
                        "required": True,
                        "options": [
                            {"id": "aries", "name": "Aries ♈"},
                            {"id": "taurus", "name": "Taurus ♉"},
                            {"id": "gemini", "name": "Gemini ♊"},
                            {"id": "cancer", "name": "Cancer ♋"},
                            {"id": "leo", "name": "Leo ♌"},
                            {"id": "virgo", "name": "Virgo ♍"},
                            {"id": "libra", "name": "Libra ♎"},
                            {"id": "scorpio", "name": "Scorpio ♏"},
                            {"id": "sagittarius", "name": "Sagittarius ♐"},
                            {"id": "capricorn", "name": "Capricorn ♑"},
                            {"id": "aquarius", "name": "Aquarius ♒"},
                            {"id": "pisces", "name": "Pisces ♓"}
                        ]
                    },
                    {
                        "name": "day",
                        "type": "select",
                        "label": "Day",
                        "required": True,
                        "options": [
                            {"id": "today", "name": "Today"},
                            {"id": "tomorrow", "name": "Tomorrow"},
                            {"id": "yesterday", "name": "Yesterday"}
                        ]
                    }
                ],
                "handler": self.get_daily_horoscope
            }
        ]
    
    def get_daily_horoscope(self, params, context=None):
        """Fetch horoscope from public API"""
        sign = params.get("sign", "aries").lower()
        day = params.get("day", "today").lower()
        
        try:
            url = f"https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign={sign}&day={day}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            horoscope_text = data.get("data", {}).get("horoscope_data", "No horoscope available")
            
            return {
                "success": True,
                "sign": sign.capitalize(),
                "day": day.capitalize(),
                "horoscope": horoscope_text,
                "date": data.get("data", {}).get("date", "")
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
