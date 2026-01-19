from abc import ABC, abstractmethod

class IService(ABC):
    """
    Interface for a Service integration.
    This class should be implemented to define the concrete logic for interacting with an external API.
    """
    
    @property
    @abstractmethod
    def slug(self) -> str:
        """Unique identifier for the service (e.g., 'spotify', 'weather'). Matching the DB Service.slug."""
        pass

class IAction(ABC):
    """
    Interface for an Action (Trigger).
    """
    @property
    @abstractmethod
    def slug(self) -> str:
        """Unique identifier for the action. Matching the DB Action.slug."""
        pass

    @abstractmethod
    def check_trigger(self, params: dict, context: dict = None) -> bool:
        """
        Check if the trigger condition is met.
        :param params: The user-configured parameters for this action.
        :param context: Context data like {'area_id': 1} to access state.
        :return: True if the reaction should be triggered.
        """
        pass

class IReaction(ABC):
    """
    Interface for a Reaction.
    """
    @property
    @abstractmethod
    def slug(self) -> str:
        """Unique identifier for the reaction. Matching the DB Reaction.slug."""
        pass

    @abstractmethod
    def execute(self, params: dict) -> None:
        """
        Perform the reaction.
        :param params: The user-configured parameters for this reaction.
        """
        pass
