from typing import List, Dict, Any
from .base import BaseProvider
from .registry import ProviderRegistry

@ProviderRegistry.register
class AIDetectionProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return 'ai_detection'

    @property
    def display_name(self) -> str:
        return 'AI Detection'

    @property
    def icon_url(self) -> str:
        return 'https://cdn-icons-png.flaticon.com/512/1698/1698535.png'

    @property
    def requires_auth(self) -> bool:
        return False

    def get_actions(self) -> List[Dict[str, Any]]:
        return []

    def get_reactions(self) -> List[Dict[str, Any]]:
        return [
            {
                'name': 'detect_ai_text',
                'display_name': 'Détecter Texte IA',
                'description': 'Detect if text is AI-generated',
                'params': [
                    {'name': 'text', 'type': 'string'},
                    {'name': 'lang', 'type': 'string'}
                ]
            }
        ]
