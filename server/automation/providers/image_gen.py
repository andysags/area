from typing import List, Dict, Any
from .base import BaseProvider
from .registry import ProviderRegistry

@ProviderRegistry.register
class ImageGenProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return 'image_gen'

    @property
    def display_name(self) -> str:
        return 'Flux Image Gen'

    @property
    def icon_url(self) -> str:
        return 'https://cdn-icons-png.freepik.com/512/8637/8637099.png'

    @property
    def requires_auth(self) -> bool:
        return False

    def get_actions(self) -> List[Dict[str, Any]]:
        return []

    def get_reactions(self) -> List[Dict[str, Any]]:
        return [
            {
                'name': 'generate_image',
                'display_name': 'Générer une Image',
                'description': 'Generate an image from text using Flux AI',
                'params': [
                    {'name': 'prompt', 'type': 'string'},
                    {'name': 'style_id', 'type': 'number'},
                    {'name': 'size', 'type': 'select', 'options': ['1-1', '16-9', '9-16', '3-2', '2-3']}
                ]
            }
        ]
