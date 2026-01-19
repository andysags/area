from typing import List, Dict, Any
from .base import BaseProvider
from .registry import ProviderRegistry

@ProviderRegistry.register
class GitHubProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return 'github'

    @property
    def display_name(self) -> str:
        return 'GitHub'

    @property
    def icon_url(self) -> str:
        return 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'

    def get_actions(self) -> List[Dict[str, Any]]:
        return [
            {
                'name': 'new_commit',
                'display_name': 'Nouveau Commit',
                'description': 'Triggers when a new commit is pushed to a repository',
                'params': [{'name': 'repository', 'type': 'string'}]
            },
            {
                'name': 'new_issue',
                'display_name': 'Nouvelle Issue',
                'description': 'Triggers when a new issue is created',
                'params': [{'name': 'repository', 'type': 'string'}]
            },
            {
                'name': 'new_pull_request',
                'display_name': 'Nouvelle Pull Request',
                'description': 'Triggers when a new pull request is created',
                'params': [{'name': 'repository', 'type': 'string'}]
            }
        ]

    def get_reactions(self) -> List[Dict[str, Any]]:
        return [
            {
                'name': 'create_issue',
                'display_name': 'Créer une Issue',
                'description': 'Create a new issue in a repository',
                'params': [
                    {'name': 'repository', 'type': 'string'},
                    {'name': 'title', 'type': 'string'},
                    {'name': 'body', 'type': 'string'}
                ]
            }
        ]
