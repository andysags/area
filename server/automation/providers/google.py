from typing import List, Dict, Any
from .base import BaseProvider
from .registry import ProviderRegistry

@ProviderRegistry.register
class GmailProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return 'gmail'

    @property
    def display_name(self) -> str:
        return 'GMail'

    @property
    def icon_url(self) -> str:
        return 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg'

    def get_actions(self) -> List[Dict[str, Any]]:
        return [
            {
                'name': 'gmail_new_email',
                'display_name': 'Nouvel Email',
                'description': 'Triggers when a new email is received',
                'params': []
            }
        ]

    def get_reactions(self) -> List[Dict[str, Any]]:
        return [
            {
                'name': 'gmail_send_email',
                'display_name': 'Envoyer un Email',
                'description': 'Send an email',
                'params': [
                    {'name': 'to', 'type': 'string'},
                    {'name': 'subject', 'type': 'string'},
                    {'name': 'body', 'type': 'string'}
                ]
            }
        ]
