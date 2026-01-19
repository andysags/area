from django.apps import AppConfig

class AutomationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "automation"
    verbose_name = "Automation Domain"

    def ready(self):
        from .providers.registry import ProviderRegistry
        from .providers.google import GmailProvider
        from .providers.github import GitHubProvider
        from .providers.discord import DiscordProvider
        from .providers.spotify import SpotifyProvider
        from .providers.twitter import TwitterProvider
        from .providers.telegram import TelegramProvider
        from .providers.weatherapi import WeatherAPIProvider

        ProviderRegistry.register(GmailProvider)
        ProviderRegistry.register(GitHubProvider)
        ProviderRegistry.register(DiscordProvider)
        ProviderRegistry.register(SpotifyProvider)
        ProviderRegistry.register(TwitterProvider)
        ProviderRegistry.register(TelegramProvider)
        # ProviderRegistry.register(WeatherAPIProvider)
