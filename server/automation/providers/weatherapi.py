from typing import List, Dict, Any
from .base import BaseProvider
from .registry import ProviderRegistry

@ProviderRegistry.register
class WeatherAPIProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return 'weatherapi'

    @property
    def display_name(self) -> str:
        return 'WeatherAPI'

    @property
    def icon_url(self) -> str:
        return 'https://cdn.weatherapi.com/v4/images/weatherapi_logo.png'

    @property
    def requires_auth(self) -> bool:
        return False

    def get_actions(self) -> List[Dict[str, Any]]:
        return [
            {
                'name': 'temperature_change',
                'display_name': 'Changement de Température',
                'description': 'Triggers when temperature changes in a location',
                'params': [{'name': 'location', 'type': 'string'}]
            }
        ]

    def get_reactions(self) -> List[Dict[str, Any]]:
        return [] # WeatherAPI is usually a trigger source, not an actor
