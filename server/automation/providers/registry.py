from typing import Dict, Type
from .base import BaseProvider

class ProviderRegistry:
    _providers: Dict[str, BaseProvider] = {}

    @classmethod
    def register(cls, provider_cls: Type[BaseProvider]):
        provider = provider_cls()
        cls._providers[provider.service_name] = provider
        return provider_cls

    @classmethod
    def get_provider(cls, service_name: str) -> BaseProvider:
        return cls._providers.get(service_name)

    @classmethod
    def get_all_providers(cls):
        return cls._providers.values()
