from typing import List, Dict, Any
from .base import BaseProvider
from .registry import ProviderRegistry

@ProviderRegistry.register
class InstagramProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return 'instagram'

    @property
    def display_name(self) -> str:
        return 'Instagram'

    @property
    def icon_url(self) -> str:
        return 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg'

    @property
    def requires_auth(self) -> bool:
        return False

    def get_actions(self) -> List[Dict[str, Any]]:
        return [
            {
                'name': 'new_post',
                'display_name': 'Nouveau Post',
                'description': 'Triggers when a user posts a new photo/video',
                'params': [{'name': 'username', 'type': 'string'}]
            }
        ]

    def get_reactions(self) -> List[Dict[str, Any]]:
        return []
