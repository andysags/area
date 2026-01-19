from .. import register_reaction
from automation.providers.registry import ProviderRegistry

@register_reaction("get_job_details")
def executor(area, context=None):
    """
    Wrapper for JobSearchProvider.get_job_details
    """
    try:
        provider = ProviderRegistry.get_provider("job_search")
        config = area.config_reaction or {}
        
        if context:
            for k, v in config.items():
                if isinstance(v, str):
                    for ctx_k, ctx_v in context.items():
                        if isinstance(ctx_v, str):
                            v = v.replace(f"{{{ctx_k}}}", ctx_v)
                    config[k] = v

        return provider.get_job_details(config, context)
    except Exception as e:
        return {"error": str(e)}
