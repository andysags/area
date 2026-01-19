from typing import List, Dict, Any
from .base import BaseProvider
from .registry import ProviderRegistry

@ProviderRegistry.register
class TwitterProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return 'twitter'

    @property
    def display_name(self) -> str:
        return 'Twitter / X'

    @property
    def icon_url(self) -> str:
        return 'https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg'

    def get_actions(self) -> List[Dict[str, Any]]:
        return [
            {
                'name': 'new_tweet',
                'display_name': 'Nouveau Tweet',
                'description': 'Triggers when a user posts a new tweet',
                'params': [{'name': 'username', 'type': 'string'}]
            }
        ]

    def get_reactions(self) -> List[Dict[str, Any]]:
        return [
            {
                'name': 'post_tweet',
                'display_name': 'Poster un Tweet',
                'description': 'Post a new tweet',
                'params': [{'name': 'text', 'type': 'string'}]
            }
        ]
