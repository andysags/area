from .. import register_reaction
from automation.providers.registry import ProviderRegistry

@register_reaction("get_anime_details")
def executor(area, context=None):
    """
    Wrapper for AnimeProvider.get_anime_details
    """
    try:
        provider = ProviderRegistry.get_provider("anime")
        config = area.config_reaction or {}
        
        # Template parameter replacement
        if context:
            for k, v in config.items():
                if isinstance(v, str):
                    for ctx_k, ctx_v in context.items():
                        if isinstance(ctx_v, str):
                            v = v.replace(f"{{{ctx_k}}}", ctx_v)
                    config[k] = v

        return provider.get_anime_details(config, context)
    except Exception as e:
        return {"error": str(e)}
