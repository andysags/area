from .. import register_reaction
from automation.providers.registry import ProviderRegistry

@register_reaction("get_market_news")
def executor(area, context=None):
    """
    Wrapper for YahooFinanceProvider.get_market_news
    """
    try:
        provider = ProviderRegistry.get_provider("yahoo_finance")
        config = area.config_reaction or {}
        
        # Template parameter replacement (e.g. ticker from context)
        if context:
            for k, v in config.items():
                if isinstance(v, str):
                    for ctx_k, ctx_v in context.items():
                        if isinstance(ctx_v, str):
                            v = v.replace(f"{{{ctx_k}}}", ctx_v)
                    config[k] = v

        return provider.get_market_news(config, context)
    except Exception as e:
        return {"error": str(e)}
