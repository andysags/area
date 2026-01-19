from typing import List, Dict, Any
from .base import BaseProvider
from .registry import ProviderRegistry

@ProviderRegistry.register
class TelegramProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return 'telegram'

    @property
    def display_name(self) -> str:
        return 'Telegram'

    @property
    def icon_url(self) -> str:
        return 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg'

    def get_actions(self) -> List[Dict[str, Any]]:
        return [
            {
                'name': 'new_message',
                'display_name': 'Nouveau Message',
                'description': 'Triggers when a new message is received',
                'params': [{'name': 'chat_id', 'type': 'string'}]
            }
        ]

    def get_reactions(self) -> List[Dict[str, Any]]:
        return [
            {
                'name': 'send_message',
                'display_name': 'Envoyer un Message',
                'description': 'Send a message to a chat',
                'params': [
                    {'name': 'chat_id', 'type': 'string'},
                    {'name': 'text', 'type': 'string'}
                ]
            }
        ]
