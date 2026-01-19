from typing import List, Dict, Any
from .base import BaseProvider
from .registry import ProviderRegistry

@ProviderRegistry.register
class DiscordProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return 'discord'

    @property
    def display_name(self) -> str:
        return 'Discord'

    @property
    def icon_url(self) -> str:
        return 'https://assets-global.website-files.com/6257adef93867e56f84d3092/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png'

    def get_actions(self) -> List[Dict[str, Any]]:
        return [
            {
                'name': 'new_message',
                'display_name': 'Nouveau Message',
                'description': 'Triggers when a new message is posted in a channel',
                'params': [{'name': 'channel_id', 'type': 'string'}]
            }
        ]

    def get_reactions(self) -> List[Dict[str, Any]]:
        return [
            {
                'name': 'send_message',
                'display_name': 'Envoyer un Message',
                'description': 'Post a message to a channel',
                'params': [
                    {'name': 'channel_id', 'type': 'string'},
                    {'name': 'content', 'type': 'string'}
                ]
            }
        ]
