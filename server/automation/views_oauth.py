from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from django.core.signing import Signer, BadSignature
from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Service, UserService
import os
import requests
import urllib.parse
from django.contrib.auth import get_user_model

User = get_user_model()

class GitHubAuthURLView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        client_id = os.environ.get('GITHUB_CLIENT_ID')
        if not client_id:
            return Response({"error": "GitHub Client ID not configured"}, status=500)

        next_url = request.GET.get('next', '/dashboard')
        signer = Signer()
        state = signer.sign(f"{request.user.id}|{next_url}")
        
        # Callback URL should assume frontend or use a backend endpoint that redirects
        # We will use a backend endpoint for the callback to handle the code exchange securely
        # Assuming backend runs on localhost:8080 or specified in settings
        # Using a relative path which the browser resolves, or hardcoding standard dev URL
        # Better to grab base URL from request or settings
        # For this env, likely http://localhost:8080/github/callback/
        
        redirect_uri = "http://localhost:8080/github/callback/"
        
        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "scope": "repo user",
            "state": state
        }
        
        url = f"https://github.com/login/oauth/authorize?{urllib.parse.urlencode(params)}"
        return Response({"url": url})

class GitHubCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        print(f"[DEBUG] GitHub callback received: code={request.GET.get('code')[:10]}..., state={request.GET.get('state')[:10]}...")
        code = request.GET.get('code')
        state = request.GET.get('state')
        
        if not code or not state:
            print("[DEBUG] Missing code or state, redirecting with error")
            return redirect("http://localhost:8081/dashboard?error=missing_params")

        # Verify state to get user
        signer = Signer()
        try:
            state_val = signer.unsign(state)
            user_id, next_url = state_val.split('|', 1)
            user = User.objects.get(id=user_id)
            print(f"[DEBUG] User verified: {user.email}, Next: {next_url}")
        except (BadSignature, User.DoesNotExist, ValueError) as e:
            print(f"[DEBUG] State verification failed: {e}")
            return redirect("http://localhost:8081/dashboard?error=invalid_state")
        except (BadSignature, User.DoesNotExist) as e:
            print(f"[DEBUG] State verification failed: {e}")
            return redirect("http://localhost:8081/dashboard?error=invalid_state")

        # Exchange code
        client_id = os.environ.get('GITHUB_CLIENT_ID')
        client_secret = os.environ.get('GITHUB_CLIENT_SECRET')
        redirect_uri = "http://localhost:8080/github/callback/"
        
        print(f"[DEBUG] Exchanging code with GitHub...")
        token_url = "https://github.com/login/oauth/access_token"
        headers = {"Accept": "application/json"}
        data = {
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "redirect_uri": redirect_uri
        }
        
        resp = requests.post(token_url, json=data, headers=headers)
        print(f"[DEBUG] GitHub response status: {resp.status_code}")
        if resp.status_code != 200:
             print(f"[DEBUG] Token exchange failed, redirecting with error")
             return redirect("http://localhost:8081/dashboard?error=github_token_exchange_failed")
             
        token_data = resp.json()
        access_token = token_data.get('access_token')
        print(f"[DEBUG] Access token received: {bool(access_token)}")
        
        if not access_token:
            print(f"[DEBUG] No access token in response: {token_data}")
            return redirect("http://localhost:8081/dashboard?error=no_access_token")

        # Save to UserService
        try:
            service = Service.objects.get(name='github')
            print(f"[DEBUG] Service found: {service.name}")
            user_service, created = UserService.objects.update_or_create(
                user=user,
                service=service,
                defaults={}
            )
            print(f"[DEBUG] UserService {'created' if created else 'updated'}")
            
            user_service.set_tokens(access_token, "")
            user_service.save()
            print(f"[DEBUG] Token saved successfully")
            
        except Service.DoesNotExist:
             print(f"[DEBUG] GitHub service not found in database")
             return redirect("http://localhost:8081/dashboard?error=service_github_not_found")
        except Exception as e:
             print(f"Error saving github token: {e}")
             return redirect("http://localhost:8081/dashboard?error=save_failed")

        print(f"[DEBUG] Redirecting to {next_url} with success")
        print(f"[DEBUG] Redirecting to {next_url} with success")
        if next_url.startswith("http") or next_url.startswith("area://"):
            return redirect(f"{next_url}?success=github_connected")
        return redirect(f"http://localhost:8081{next_url}?success=github_connected")

class SpotifyAuthURLView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        client_id = os.environ.get('SPOTIFY_CLIENT_ID')
        if not client_id:
            return Response({"error": "Spotify Client ID not configured"}, status=500)

        next_url = request.GET.get('next', '/dashboard')
        signer = Signer()
        state = signer.sign(f"{request.user.id}|{next_url}")
        
        # Determine redirect URI
        # Should match what is configured in Spotify Dashboard
        redirect_uri = "http://127.0.0.1:8080/spotify/callback/"
        
        params = {
            "client_id": client_id,
            "response_type": "code",
            "redirect_uri": redirect_uri,
            "scope": "user-library-read playlist-modify-public playlist-modify-private",
            "state": state
        }
        
        url = f"https://accounts.spotify.com/authorize?{urllib.parse.urlencode(params)}"
        return Response({"url": url})

class SpotifyCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.GET.get('code')
        state = request.GET.get('state')
        
        if not code or not state:
            return redirect("http://localhost:8081/dashboard?error=missing_params")

        # Verify state
        signer = Signer()
        try:
            state_val = signer.unsign(state)
            user_id, next_url = state_val.split('|', 1)
            user = User.objects.get(id=user_id)
        except (BadSignature, User.DoesNotExist, ValueError):
            return redirect("http://localhost:8081/dashboard?error=invalid_state")

        # Exchange code
        client_id = os.environ.get('SPOTIFY_CLIENT_ID')
        client_secret = os.environ.get('SPOTIFY_CLIENT_SECRET')
        redirect_uri = "http://127.0.0.1:8080/spotify/callback/"
        
        token_url = "https://accounts.spotify.com/api/token"
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "client_id": client_id,
            "client_secret": client_secret
        }
        
        resp = requests.post(token_url, data=data) # Spotify expects form-data, not json usually, but requests handles data= as form
        
        if resp.status_code != 200:
             print(f"[ERROR] Spotify token exchange failed: {resp.text}")
             return redirect("http://localhost:8081/dashboard?error=spotify_token_exchange_failed")
             
        token_data = resp.json()
        access_token = token_data.get('access_token')
        refresh_token = token_data.get('refresh_token')
        expires_in = token_data.get('expires_in', 3600)
        
        if not access_token:
            return redirect("http://localhost:8081/dashboard?error=no_access_token")

        # Save to UserService
        try:
            service = Service.objects.get(name='spotify')
            user_service, created = UserService.objects.update_or_create(
                user=user,
                service=service,
                defaults={}
            )
            user_service.set_tokens(access_token, refresh_token or "")
            user_service.expires_at = timezone.now() + timedelta(seconds=expires_in)
            user_service.save()
            
        except Service.DoesNotExist:
             return redirect("http://localhost:8081/dashboard?error=service_spotify_not_found")

        if next_url.startswith("http") or next_url.startswith("area://"):
             return redirect(f"{next_url}?success=spotify_connected")
        return redirect(f"http://localhost:8081{next_url}?success=spotify_connected")
