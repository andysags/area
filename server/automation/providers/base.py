from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseProvider(ABC):
    """
    Abstract base class for all service providers.
    """
    
    @property
    @abstractmethod
    def service_name(self) -> str:
        """Unique identifier for the service (e.g., 'google', 'github')."""
        pass

    @property
    @abstractmethod
    def display_name(self) -> str:
        """Human-readable name."""
        pass

    @property
    def icon_url(self) -> str:
        """URL to the service icon."""
        return ""
    
    @property
    def requires_auth(self) -> bool:
        """Whether this service requires OAuth authentication. Default is True."""
        return True

    @abstractmethod
    def get_actions(self) -> List[Dict[str, Any]]:
        """
        Returns a list of available actions.
        Format: [{'name': 'new_mail', 'description': 'New email received'}]
        """
        pass

    @abstractmethod
    def get_reactions(self) -> List[Dict[str, Any]]:
        """
        Returns a list of available reactions.
        Format: [{'name': 'send_mail', 'description': 'Send an email'}]
        """
        pass
