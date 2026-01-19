from typing import List, Dict, Any
from .base import BaseProvider
from .registry import ProviderRegistry

@ProviderRegistry.register
class AliExpressProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return 'aliexpress'

    @property
    def display_name(self) -> str:
        return 'AliExpress'

    @property
    def icon_url(self) -> str:
        return 'https://upload.wikimedia.org/wikipedia/commons/3/3b/AliExpress_logo.svg'

    @property
    def requires_auth(self) -> bool:
        return False

    def get_actions(self) -> List[Dict[str, Any]]:
        return [
            {
                'name': 'price_change',
                'display_name': 'Changement de Prix',
                'description': 'Triggers when the price of an item changes',
                'params': [{'name': 'item_id', 'type': 'string'}]
            }
        ]

    def get_reactions(self) -> List[Dict[str, Any]]:
        return []
