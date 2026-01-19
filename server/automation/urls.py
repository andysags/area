from django.urls import path
from .views import (
    ServiceListView,
    ServiceDetailView,
    ServiceActionsView,
    ServiceReactionsView,
    ServiceSubscribeView,
    ServiceUnsubscribeView,
    UserSubscriptionsView,
    AboutView,
    AreaListCreateView,
    AreaDetailView,
    AreaLogsView,
    DashboardStatsView,
)
from .views_oauth import GitHubAuthURLView, GitHubCallbackView, SpotifyAuthURLView, SpotifyCallbackView
from .views_github import GitHubRepositoriesView
from .views_spotify import SpotifyPlaylistsView

urlpatterns = [
    path('about.json', AboutView.as_view(), name='about_json'),

    # Areas
    path('areas/', AreaListCreateView.as_view(), name='areas_list_create'),
    path('areas/<uuid:id>/', AreaDetailView.as_view(), name='areas_detail'),
    path('areas/logs/', AreaLogsView.as_view(), name='areas_logs'),
    path('services/', ServiceListView.as_view(), name='service_list'),
    path('services/subscriptions/', UserSubscriptionsView.as_view(), name='user_subscriptions'),
    path('services/<uuid:id>/', ServiceDetailView.as_view(), name='service_detail'),
    path('services/<uuid:id>/actions/', ServiceActionsView.as_view(), name='service_actions'),
    
    # OAuth
    
    # Stats
    path('stats/', DashboardStatsView.as_view(), name='dashboard_stats'),

    # OAuth
    path('github/connect/', GitHubAuthURLView.as_view(), name='github_connect'),
    path('github/callback/', GitHubCallbackView.as_view(), name='github_callback'),
    path('github/repositories/', GitHubRepositoriesView.as_view(), name='github_repositories'),
    
    path('spotify/connect/', SpotifyAuthURLView.as_view(), name='spotify_connect'),
    path('spotify/callback/', SpotifyCallbackView.as_view(), name='spotify_callback'),
    path('spotify/playlists/', SpotifyPlaylistsView.as_view(), name='spotify_playlists'),
    
    path('services/<uuid:id>/reactions/', ServiceReactionsView.as_view(), name='service_reactions'),
    path('services/<uuid:id>/subscribe/', ServiceSubscribeView.as_view(), name='service_subscribe'),
    path('services/<uuid:id>/unsubscribe/', ServiceUnsubscribeView.as_view(), name='service_unsubscribe'),
]
