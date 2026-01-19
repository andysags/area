from rest_framework import generics, permissions, status, throttling
from rest_framework_simplejwt.views import TokenObtainPairView
import logging
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer, OAuthLinkSerializer, OAuthAccountSerializer, NotificationPreferencesSerializer
from .models import OAuthAccount, NotificationPreferences, EmailVerificationCode, UserSession
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.core.mail import BadHeaderError, send_mail
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import requests
from django.utils import timezone
from datetime import timedelta
from automation.models import Service, UserService

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer
    throttle_classes = [throttling.AnonRateThrottle]

class UserProfileView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UploadAvatarView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        print(f"📸 Avatar upload request from user: {request.user.email}")
        print(f"📦 FILES: {request.FILES.keys()}")
        
        if 'avatar' not in request.FILES:
            print("❌ No avatar file in request")
            return Response({"error": "No avatar file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        avatar_file = request.FILES['avatar']
        print(f"📄 File: {avatar_file.name}, size: {avatar_file.size}, type: {avatar_file.content_type}")
        
        # Validate file size (max 5MB)
        if avatar_file.size > 5 * 1024 * 1024:
            print("❌ File too large")
            return Response({"error": "File size too large (max 5MB)"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if avatar_file.content_type not in allowed_types:
            print(f"❌ Invalid file type: {avatar_file.content_type}")
            return Response({"error": "Invalid file type. Allowed: JPG, PNG, GIF, WEBP"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete old avatar if exists
        if request.user.avatar:
            print(f"🗑️ Deleting old avatar: {request.user.avatar.name}")
            request.user.avatar.delete(save=False)
        
        # Save new avatar
        request.user.avatar = avatar_file
        request.user.save()
        print(f"✅ Avatar saved: {request.user.avatar.url}")
        
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class DeleteAvatarView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def delete(self, request):
        if request.user.avatar:
            request.user.avatar.delete(save=False)
            request.user.avatar = None
            request.user.save()
        
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class OAuthLinkView(generics.CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = OAuthLinkSerializer
    throttle_classes = [throttling.UserRateThrottle]

    def create(self, request, *args, **kwargs):
        # Tolérant: créer/mettre à jour le compte OAuth sans rejeter 400 sur champs optionnels
        data = request.data
        provider = data.get('provider')
        external_user_id = data.get('external_user_id')
        access_token = data.get('access_token')
        if not provider or not external_user_id or not access_token:
            return Response({"error": {"code": "VALIDATION_ERROR", "message": "provider, external_user_id and access_token are required"}}, status=status.HTTP_400_BAD_REQUEST)

        from datetime import datetime, timezone
        expires_dt = None
        expires_at = data.get('expires_at')
        if isinstance(expires_at, int):
            expires_dt = datetime.fromtimestamp(expires_at, tz=timezone.utc)

        scopes = data.get('scopes')
        scopes_str = ','.join(scopes) if isinstance(scopes, list) else None

        account, _ = OAuthAccount.objects.update_or_create(
            user=request.user,
            provider=provider,
            external_user_id=external_user_id,
            defaults={
                'access_token': access_token,
                'refresh_token': data.get('refresh_token'),
                'expires_at': expires_dt,
                'scopes': scopes_str,
            }
        )
        out = {"id": account.id, "provider": account.provider, "external_user_id": account.external_user_id}
        return Response(out, status=status.HTTP_201_CREATED)


class OAuthAccountsListView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = OAuthAccountSerializer
    throttle_classes = [throttling.UserRateThrottle]

    def get_queryset(self):
        return OAuthAccount.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        accounts = self.get_queryset()
        serializer = self.get_serializer(accounts, many=True)
        return Response(serializer.data)


class OAuthAccountDeleteView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    throttle_classes = [throttling.UserRateThrottle]

    def delete(self, request, account_id):
        try:
            account = OAuthAccount.objects.get(id=account_id, user=request.user)
            account.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except OAuthAccount.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class ChangePasswordView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    throttle_classes = [throttling.UserRateThrottle]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return Response({'error': 'Old and new passwords are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if not user.check_password(old_password):
            return Response({'error': 'Wrong old password.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Optional: Add password complexity validation here replicating RegisterSerializer logic
        if len(new_password) < 8:
             return Response({'error': 'Password must be at least 8 characters long.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'status': 'Password updated successfully.'})

class DeleteAccountView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def delete(self, request):
        user = request.user
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def delete(self, request, account_id):
        try:
            account = OAuthAccount.objects.get(id=account_id, user=request.user)
        except OAuthAccount.DoesNotExist:
            return Response({"error": {"code": "OAUTH_NOT_FOUND", "message": "OAuth account not found"}}, status=status.HTTP_404_NOT_FOUND)
        account.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
class GoogleOAuthExchangeView(APIView):
    """
    POST /auth/oauth/google/exchange
    Body: {"code": "...", "redirect_uri": "http://localhost:8081/"}
    Requires Authorization: Bearer <JWT>
    Exchanges code against Google token endpoint and stores tokens in UserService for 'gmail'.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        code = request.data.get("code")
        redirect_uri = request.data.get("redirect_uri") or getattr(settings, "GOOGLE_REDIRECT_URI", "http://localhost:8081/")
        client_id = getattr(settings, "GOOGLE_CLIENT_ID", None)
        client_secret = getattr(settings, "GOOGLE_CLIENT_SECRET", None)

        if not code or not client_id or not client_secret:
            return Response({
                "error": {
                    "code": "MISSING_PARAMS",
                    "message": "code, GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required"
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }
        try:
            resp = requests.post(token_url, data=data, timeout=15)
            if resp.status_code != 200:
                return Response({
                    "error": {
                        "code": "TOKEN_EXCHANGE_FAILED",
                        "message": f"Google returned {resp.status_code}",
                        "details": resp.text,
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            payload = resp.json()
        except Exception as e:
            return Response({
                "error": {
                    "code": "REQUEST_ERROR",
                    "message": str(e),
                }
            }, status=status.HTTP_502_BAD_GATEWAY)

        access_token = payload.get("access_token")
        refresh_token = payload.get("refresh_token", "")
        expires_in = payload.get("expires_in")

        if not access_token:
            return Response({
                "error": {
                    "code": "NO_ACCESS_TOKEN",
                    "message": "No access_token returned by Google",
                    "details": payload,
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        # Link tokens to current user for 'google' service
        try:
            service = Service.objects.get(name="google")
        except Service.DoesNotExist:
            return Response({
                "error": {
                    "code": "SERVICE_NOT_FOUND",
                    "message": "Service 'gmail' not initialized. Run init_services.",
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        us, _ = UserService.objects.update_or_create(user=request.user, service=service, defaults={})
        us.set_tokens(access_token, refresh_token)
        if isinstance(expires_in, int):
            us.expires_at = timezone.now() + timedelta(seconds=expires_in)
        us.save()

        return Response({
            "ok": True,
            "service": service.name,
            "expires_at": us.expires_at,
            "has_refresh": bool(refresh_token),
        })


class GoogleLoginView(APIView):
    """
    POST /auth/google/login/
    Body: {"code": "...", "redirect_uri": "..."}
    Exchanges code for tokens, retrieves user info, and logs in or creates user.
    Returns: { "access": "...", "refresh": "..." }
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        code = request.data.get("code")
        redirect_uri = request.data.get("redirect_uri")
        client_id = getattr(settings, "GOOGLE_CLIENT_ID", None)
        client_secret = getattr(settings, "GOOGLE_CLIENT_SECRET", None)

        if not code or not client_id or not client_secret:
            return Response({"error": "Missing code or config"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Exchange code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }
        try:
            resp = requests.post(token_url, data=data, timeout=15)
            if resp.status_code != 200:
                return Response({"error": "Google token exchange failed", "details": resp.text}, status=status.HTTP_400_BAD_REQUEST)
            tokens = resp.json()
        except Exception as e:
            return Response({"error": "Request failed", "details": str(e)}, status=status.HTTP_502_BAD_GATEWAY)

        access_token = tokens.get("access_token")
        
        # 2. Get User Info
        user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        try:
            u_resp = requests.get(user_info_url, headers={"Authorization": f"Bearer {access_token}"}, timeout=15)
            if u_resp.status_code != 200:
                return Response({"error": "Failed to get user info"}, status=status.HTTP_400_BAD_REQUEST)
            user_info = u_resp.json()
        except Exception as e:
            return Response({"error": "Request failed", "details": str(e)}, status=status.HTTP_502_BAD_GATEWAY)

        email = user_info.get("email")
        if not email:
            return Response({"error": "No email provided by Google"}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Find or Create User
        # 3. Find or Create User
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Create a new user with random password
            from django.utils.crypto import get_random_string
            user = User.objects.create_user(
                email=email,
                password=get_random_string(32),
                first_name=user_info.get("given_name", ""),
                last_name=user_info.get("family_name", "")
            )
            user.save()

        # 4. Generate JWT
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })


class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    throttle_classes = [throttling.UserRateThrottle]

    def post(self, request):
        # Pour SimpleJWT sans blacklist activée, on retourne 204.
        return Response(status=status.HTTP_204_NO_CONTENT)


from .throttles import LoginRateThrottle


class LoginView(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)
    throttle_classes = [LoginRateThrottle]
    logger = logging.getLogger('accounts')

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        
        # Vérifier d'abord les identifiants
        try:
            user = User.objects.get(email=email)
            if not user.check_password(password):
                self.logger.info(f"login_failed email={email} reason=invalid_password")
                return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            self.logger.info(f"login_failed email={email} reason=user_not_found")
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # Si la 2FA est activée, envoyer un code par email
        if user.two_factor_enabled:
            # Créer et envoyer le code
            verification_code = EmailVerificationCode.create_for_user(user)
            
            try:
                send_mail(
                    subject='Code de vérification - Connexion',
                    message=f'Votre code de vérification est : {verification_code.code}\n\nCe code expire dans 10 minutes.',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
                self.logger.info(f"login_2fa_code_sent email={email}")
            except Exception as e:
                self.logger.error(f"Failed to send 2FA code to {email}: {e}")
                return Response({
                    "detail": "Erreur lors de l'envoi du code de vérification"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                "requires_2fa": True,
                "message": "Un code de vérification a été envoyé à votre email"
            }, status=status.HTTP_200_OK)

        # Sinon, continuer avec le login normal
        resp = super().post(request, *args, **kwargs)
        status_code = resp.status_code
        if status_code == status.HTTP_200_OK:
            self.logger.info(f"login_success email={email}")
            # Créer la session
            try:
                access_token = resp.data.get('access')
                if access_token:
                    UserSession.create_or_update_session(user, access_token, request)
            except Exception as e:
                self.logger.error(f"Failed to create session: {e}")
        else:
            self.logger.info(f"login_failed email={email} status={status_code}")
        return resp


@method_decorator(csrf_exempt, name='dispatch')
class PasswordResetAPIView(APIView):
    """API endpoint to request a password reset email.

    POST { "email": "user@example.com" }
    Returns 200 even if the email does not exist to avoid account enumeration.
    """
    permission_classes = (permissions.AllowAny,)
    throttle_classes = [throttling.AnonRateThrottle]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"detail": "email is required"}, status=status.HTTP_400_BAD_REQUEST)

        form = PasswordResetForm(data={'email': email})
        if form.is_valid():
            # Use Django's PasswordResetForm to send the email using configured EMAIL_BACKEND
            try:
                form.save(
                    request=request,
                    use_https=request.is_secure(),
                    token_generator=default_token_generator,
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None),
                    email_template_name='accounts/password_reset_email.html',
                )
            except BadHeaderError:
                return Response({"detail": "Invalid header found."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Always return 200 to avoid leaking whether the email exists
        return Response({"detail": "If an account exists for this email, a reset link has been sent."}, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class PasswordResetConfirmAPIView(APIView):
    """API endpoint to confirm a password reset.

    POST { "uid": "<uidb64>", "token": "<token>", "new_password": "..." }
    Returns 200 on success, 400 on failure.
    """
    permission_classes = (permissions.AllowAny,)
    throttle_classes = [throttling.AnonRateThrottle]

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not new_password:
            return Response({"detail": "new_password is required"}, status=status.HTTP_400_BAD_REQUEST)

        if not uidb64 or not token:
            return Response({"detail": "uid and token are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({"detail": "Invalid uid"}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        # Set the new password
        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password has been reset."}, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """API endpoint pour changer le mot de passe de l'utilisateur connecté."""
    permission_classes = (permissions.IsAuthenticated,)
    throttle_classes = [throttling.UserRateThrottle]

    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response({"detail": "old_password and new_password are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.check_password(old_password):
            return Response({"detail": "Ancien mot de passe incorrect"}, status=status.HTTP_400_BAD_REQUEST)

        # Validation du nouveau mot de passe
        if len(new_password) < 8:
            return Response({"detail": "Le mot de passe doit contenir au moins 8 caractères"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Mot de passe modifié avec succès"}, status=status.HTTP_200_OK)


class DeleteAccountView(APIView):
    """API endpoint pour supprimer définitivement le compte utilisateur."""
    permission_classes = (permissions.IsAuthenticated,)
    throttle_classes = [throttling.UserRateThrottle]

    def delete(self, request):
        password = request.data.get('password')
        
        if not password:
            return Response({"detail": "password is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.check_password(password):
            return Response({"detail": "Mot de passe incorrect"}, status=status.HTTP_400_BAD_REQUEST)

        # Supprimer l'utilisateur et toutes ses données associées
        user.delete()
        return Response({"detail": "Compte supprimé avec succès"}, status=status.HTTP_204_NO_CONTENT)


class NotificationPreferencesView(APIView):
    """API endpoint pour gérer les préférences de notifications."""
    permission_classes = (permissions.IsAuthenticated,)
    throttle_classes = [throttling.UserRateThrottle]

    def get(self, request):
        """Récupérer les préférences de notifications."""
        prefs, created = NotificationPreferences.objects.get_or_create(user=request.user)
        serializer = NotificationPreferencesSerializer(prefs)
        return Response(serializer.data)

    def patch(self, request):
        """Mettre à jour les préférences de notifications."""
        prefs, created = NotificationPreferences.objects.get_or_create(user=request.user)
        serializer = NotificationPreferencesSerializer(prefs, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TwoFactorSetupView(APIView):
    """API endpoint pour configurer l'authentification à deux facteurs par email."""
    permission_classes = (permissions.IsAuthenticated,)
    throttle_classes = [throttling.UserRateThrottle]

    def get(self, request):
        """Obtenir le statut actuel de la 2FA."""
        user = request.user
        return Response({
            'enabled': user.two_factor_enabled,
            'method': 'email'  # Toujours par email maintenant
        })

    def post(self, request):
        """Activer la 2FA par email."""
        user = request.user
        
        # Envoyer un code de test pour confirmer que ça fonctionne
        verification_code = EmailVerificationCode.create_for_user(user)
        
        try:
            send_mail(
                subject='Activation de la 2FA - Code de test',
                message=f'Votre code de test pour activer la 2FA est : {verification_code.code}\n\nEntrez ce code pour confirmer l\'activation.\n\nCe code expire dans 10 minutes.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({
                "detail": f"Erreur lors de l'envoi du code: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            "detail": "Un code de vérification a été envoyé à votre email",
            "email": user.email
        })

    def patch(self, request):
        """Confirmer l'activation de la 2FA avec le code."""
        code = request.data.get('code')
        if not code:
            return Response({"detail": "code is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        
        # Vérifier le code
        verification_code = EmailVerificationCode.objects.filter(
            user=user,
            code=code,
            used=False
        ).order_by('-created_at').first()

        if not verification_code or not verification_code.is_valid():
            return Response({"detail": "Code invalide ou expiré"}, status=status.HTTP_400_BAD_REQUEST)

        # Marquer le code comme utilisé et activer la 2FA
        verification_code.used = True
        verification_code.save()
        
        user.two_factor_enabled = True
        user.save()

        return Response({"detail": "2FA activée avec succès", "enabled": True})

    def delete(self, request):
        """Désactiver la 2FA."""
        password = request.data.get('password')
        if not password:
            return Response({"detail": "password is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.check_password(password):
            return Response({"detail": "Mot de passe incorrect"}, status=status.HTTP_400_BAD_REQUEST)

        user.two_factor_enabled = False
        user.save()

        return Response({"detail": "2FA désactivée avec succès", "enabled": False})



class TwoFactorVerifyView(APIView):
    """API endpoint pour vérifier le code 2FA lors de la connexion."""
    permission_classes = (permissions.AllowAny,)
    throttle_classes = [throttling.AnonRateThrottle]

    def post(self, request):
        """Vérifier le code 2FA et retourner un token."""
        from rest_framework_simplejwt.tokens import RefreshToken
        
        email = request.data.get('email')
        code = request.data.get('code')

        if not email or not code:
            return Response({"detail": "email and code are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.two_factor_enabled:
            return Response({"detail": "2FA not enabled"}, status=status.HTTP_400_BAD_REQUEST)

        # Vérifier le code email
        # Chercher le code le plus récent non utilisé
        verification_code = EmailVerificationCode.objects.filter(
            user=user,
            code=code,
            used=False
        ).order_by('-created_at').first()

        if not verification_code:
            return Response({"detail": "Code invalide ou expiré"}, status=status.HTTP_400_BAD_REQUEST)

        if not verification_code.is_valid():
            return Response({"detail": "Code expiré"}, status=status.HTTP_400_BAD_REQUEST)

        # Marquer le code comme utilisé
        verification_code.used = True
        verification_code.save()

        # Générer les tokens JWT
        refresh = RefreshToken.for_user(user)
        
        # Créer ou mettre à jour la session
        session_key = str(refresh.access_token)
        UserSession.create_or_update_session(user, session_key, request)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


class UserSessionsView(APIView):
    """API endpoint pour lister les sessions actives de l'utilisateur."""
    permission_classes = (permissions.IsAuthenticated,)
    throttle_classes = [throttling.UserRateThrottle]

    def get(self, request):
        """Lister toutes les sessions actives de l'utilisateur."""
        sessions = UserSession.objects.filter(user=request.user, is_active=True)
        
        # Obtenir la clé de session actuelle depuis le token JWT
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        current_token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else None
        
        sessions_data = []
        for session in sessions:
            is_current = session.session_key == current_token
            sessions_data.append({
                'id': session.id,
                'device_type': session.device_type,
                'browser': session.browser,
                'os': session.os,
                'ip_address': session.ip_address,
                'location': session.location or 'Localisation inconnue',
                'last_activity': session.last_activity,
                'created_at': session.created_at,
                'is_current': is_current,
            })
        
        return Response(sessions_data)


class UserSessionDeleteView(APIView):
    """API endpoint pour supprimer une session spécifique."""
    permission_classes = (permissions.IsAuthenticated,)
    throttle_classes = [throttling.UserRateThrottle]

    def delete(self, request, session_id):
        """Déconnecter une session spécifique."""
        try:
            session = UserSession.objects.get(id=session_id, user=request.user)
            
            # Vérifier si c'est la session actuelle
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            current_token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else None
            
            if session.session_key == current_token:
                return Response({
                    "detail": "Vous ne pouvez pas déconnecter votre session actuelle. Utilisez la déconnexion normale."
                }, status=status.HTTP_400_BAD_REQUEST)
            
            session.is_active = False
            session.save()
            
            return Response({"detail": "Session déconnectée avec succès"})
        except UserSession.DoesNotExist:
            return Response({"detail": "Session non trouvée"}, status=status.HTTP_404_NOT_FOUND)


class UserSessionDeleteAllView(APIView):
    """API endpoint pour déconnecter toutes les autres sessions."""
    permission_classes = (permissions.IsAuthenticated,)
    throttle_classes = [throttling.UserRateThrottle]

    def delete(self, request):
        """Déconnecter toutes les sessions sauf la session actuelle."""
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        current_token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else None
        
        # Désactiver toutes les sessions sauf la session actuelle
        sessions = UserSession.objects.filter(user=request.user, is_active=True).exclude(session_key=current_token)
        count = sessions.count()
        sessions.update(is_active=False)
        
        return Response({
            "detail": f"{count} session(s) déconnectée(s) avec succès"
        })



