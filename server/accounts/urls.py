from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views import (
    RegisterView, UserProfileView, OAuthLinkView, OAuthAccountsListView, 
    OAuthAccountDeleteView, LogoutView, LoginView, PasswordResetAPIView, 
    PasswordResetConfirmAPIView, ChangePasswordView, DeleteAccountView,
    NotificationPreferencesView, TwoFactorSetupView, TwoFactorVerifyView,
    UserSessionsView, UserSessionDeleteView, UserSessionDeleteAllView,
    UploadAvatarView, DeleteAvatarView
)
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.models import SocialApp

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('password/reset/', PasswordResetAPIView.as_view(), name='password_reset'),
    path('password/reset/confirm/', PasswordResetConfirmAPIView.as_view(), name='password_reset_confirm'),
    path('password/change/', ChangePasswordView.as_view(), name='change_password'),
    path('me/', UserProfileView.as_view(), name='user_profile'),
    path('me/delete/', DeleteAccountView.as_view(), name='delete_account'),
    path('me/avatar/upload/', UploadAvatarView.as_view(), name='upload_avatar'),
    path('me/avatar/delete/', DeleteAvatarView.as_view(), name='delete_avatar'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('oauth/link/', OAuthLinkView.as_view(), name='oauth_link'),
    path('oauth/accounts/', OAuthAccountsListView.as_view(), name='oauth_accounts'),
    path('oauth/accounts/<int:account_id>/', OAuthAccountDeleteView.as_view(), name='oauth_account_delete'),
    path('notifications/preferences/', NotificationPreferencesView.as_view(), name='notification_preferences'),
    path('2fa/setup/', TwoFactorSetupView.as_view(), name='2fa_setup'),
    path('2fa/verify/', TwoFactorVerifyView.as_view(), name='2fa_verify'),
    path('sessions/', UserSessionsView.as_view(), name='user_sessions'),
    path('sessions/<int:session_id>/', UserSessionDeleteView.as_view(), name='user_session_delete'),
    path('sessions/delete-all/', UserSessionDeleteAllView.as_view(), name='user_sessions_delete_all'),
]
