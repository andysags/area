from .. import register_action
from automation.providers.registry import ProviderRegistry
from automation.models import Area

@register_action("new_anime_airing")
def checker(area, now=None):
    """
    Wrapper for AnimeProvider.check_new_episode
    """
    try:
        provider = ProviderRegistry.get_provider("anime")
        config = area.config_action or {}
        
        # Build context override if needed
        context = {
            "area_id": area.id,
            "now": now
        }

        result = provider.check_new_episode(config, context)
        
        if result.get("triggered"):
            # Store trigger data in area context for reactions
            if not hasattr(area, '_trigger_context'):
                area._trigger_context = {}
            
            # Copy all result keys to context (except triggered)
            for k, v in result.items():
                if k != "triggered":
                    area._trigger_context[k] = v
                    
            return True
            
        return False
    except Exception as e:
        print(f"Error in new_anime_airing checker: {e}")
        return False
