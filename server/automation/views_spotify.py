from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import UserService, Service
from .utils_spotify import get_valid_spotify_token
import requests


class SpotifyPlaylistsView(APIView):
    """
    GET /spotify/playlists/ -> Fetch user's Spotify playlists
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get user's Spotify service
            service = Service.objects.get(name='spotify')
            user_service = UserService.objects.get(user=request.user, service=service)
            
            # Use utility to get valid token
            access_token = get_valid_spotify_token(user_service)

            if not access_token:
                return Response(
                    {"error": "Spotify not connected or token expired"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Fetch playlists from Spotify API
            headers = {"Authorization": f"Bearer {access_token}"}
            response = requests.get(
                "https://api.spotify.com/v1/me/playlists",
                headers=headers,
                params={"limit": 50}
            )

            if response.status_code == 401:
                return Response(
                    {"error": "Spotify token expired, please reconnect"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            if response.status_code != 200:
                return Response(
                    {"error": f"Spotify API error: {response.status_code}"},
                    status=status.HTTP_502_BAD_GATEWAY
                )

            data = response.json()
            playlists = [
                {
                    "id": playlist["id"],
                    "name": playlist["name"],
                    "owner": playlist["owner"]["display_name"],
                    "tracks_total": playlist["tracks"]["total"]
                }
                for playlist in data.get("items", [])
            ]

            return Response(playlists)

        except Service.DoesNotExist:
            return Response(
                {"error": "Spotify service not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except UserService.DoesNotExist:
            return Response(
                {"error": "Spotify not connected"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
