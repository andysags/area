from typing import List, Dict, Any
from .base import BaseProvider
from .registry import ProviderRegistry

@ProviderRegistry.register
class SystemProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return 'system'

    @property
    def display_name(self) -> str:
        return 'System'

    @property
    def icon_url(self) -> str:
        return 'https://cdn-icons-png.flaticon.com/512/2099/2099058.png'

    @property
    def requires_auth(self) -> bool:
        return False

    def get_actions(self) -> List[Dict[str, Any]]:
        return [
            {
                'name': 'timer',
                'display_name': 'Minuteur (Intervalle)',
                'description': 'Triggers every N seconds',
                'params': [
                    {'name': 'interval_seconds', 'type': 'int'}
                ]
            }
        ]

    def get_reactions(self) -> List[Dict[str, Any]]:
        return [
            {
                'name': 'log',
                'display_name': 'Journaliser (Log)',
                'description': 'Write a message into the execution log',
                'params': [
                    {'name': 'message', 'type': 'string'}
                ]
            }
        ]
