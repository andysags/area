from typing import List, Dict, Any
from .base import BaseProvider
from .registry import ProviderRegistry

@ProviderRegistry.register
class SpotifyProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return 'spotify'

    @property
    def display_name(self) -> str:
        return 'Spotify'

    @property
    def icon_url(self) -> str:
        return 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg'

    def get_actions(self) -> List[Dict[str, Any]]:
        return [
            {
                'name': 'new_saved_track',
                'display_name': 'Nouveau Titre Sauvegardé',
                'description': 'Triggers when a user saves a track',
                'params': []
            }
        ]

    def get_reactions(self) -> List[Dict[str, Any]]:
        return [
            {
                'name': 'add_to_playlist',
                'display_name': 'Ajouter à la Playlist',
                'description': 'Add a track to a playlist',
                'params': [
                    {
                        'name': 'playlist_id', 
                        'type': 'select', 
                        'label': 'Playlist',
                        'options_url': '/spotify/playlists/'
                    }
                ]
            }
        ]
