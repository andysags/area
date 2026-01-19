from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from automation.models import UserService, Service
import requests


class GitHubRepositoriesView(APIView):
    """
    GET /services/github/repositories/
    Fetch the authenticated user's GitHub repositories
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get user's GitHub service
            github_service = Service.objects.get(name='github')
            user_service = UserService.objects.get(user=request.user, service=github_service)
            
            # Get access token
            access_token = user_service.get_access_token()
            if not access_token:
                return Response(
                    {"error": "No GitHub access token found"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Fetch repositories from GitHub API
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github.v3+json"
            }
            
            # Get user's repositories (both owned and collaborated)
            response = requests.get(
                "https://api.github.com/user/repos",
                headers=headers,
                params={"per_page": 100, "sort": "updated"}
            )
            
            if response.status_code != 200:
                return Response(
                    {"error": "Failed to fetch repositories from GitHub"},
                    status=status.HTTP_502_BAD_GATEWAY
                )
            
            repos = response.json()
            
            # Format repository data
            repository_list = [
                {
                    "id": repo["id"],
                    "name": repo["name"],
                    "full_name": repo["full_name"],
                    "private": repo["private"],
                    "description": repo.get("description", ""),
                    "url": repo["html_url"]
                }
                for repo in repos
            ]
            
            return Response(repository_list, status=status.HTTP_200_OK)
            
        except Service.DoesNotExist:
            return Response(
                {"error": "GitHub service not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except UserService.DoesNotExist:
            return Response(
                {"error": "GitHub not connected. Please connect your GitHub account first."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
