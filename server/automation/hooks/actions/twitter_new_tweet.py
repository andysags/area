from .. import register_action

@register_action("new_tweet")
def checker(area, now=None):
    """
    Check for new tweets.
    STUB: Twitter Search API is expensive/restricted.
    """
    # Real logic would require polling User Timeline or Search.
    # For now, we simulate strictly for testing if enabled in config.
    action_config = getattr(area, 'config_action', {}) or area.action_parameters or {}
    
    # Simple simulation logic for testing purposes
    if action_config.get("simulate", False):
        if not hasattr(area, '_trigger_context'):
            area._trigger_context = {}
        area._trigger_context['username'] = "simulated_user"
        area._trigger_context['tweet_text'] = "This is a simulated tweet"
        return True
        
    return False
