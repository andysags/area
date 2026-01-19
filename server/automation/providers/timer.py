from typing import List, Dict, Any
from .base import BaseProvider
from .registry import ProviderRegistry

@ProviderRegistry.register
class TimerProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return 'timer'

    @property
    def display_name(self) -> str:
        return 'Timer'

    @property
    def icon_url(self) -> str:
        return "https://cdn-icons-png.flaticon.com/512/2921/2921226.png"

    @property
    def requires_auth(self) -> bool:
        return False

    def get_actions(self) -> List[Dict[str, Any]]:
        return [
            {
                'name': 'every_minute',
                'display_name': 'Chaque Minute',
                'description': 'Triggers every minute',
                'params': []
            },
            {
                'name': 'every_hour',
                'display_name': 'Chaque Heure',
                'description': 'Triggers every hour',
                'params': []
            },
            {
                'name': 'every_day',
                'display_name': 'Chaque Jour',
                'description': 'Triggers every day at a specific time',
                'params': [
                    {'name': 'time', 'type': 'time', 'description': 'Time in HH:MM format (24h)'}
                ]
            },
            {
                'name': 'cron_schedule',
                'display_name': 'Planification Cron',
                'description': 'Triggers based on a cron expression',
                'params': [
                    {'name': 'expression', 'type': 'string', 'description': 'Cron expression (e.g. "*/5 * * * *")'}
                ]
            }
        ]

    def get_reactions(self) -> List[Dict[str, Any]]:
        return [] # Timer usually doesn't have reactions
