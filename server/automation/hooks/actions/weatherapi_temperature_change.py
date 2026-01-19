from .. import register_action

@register_action("temperature_change")
def checker(area, now=None):
    cfg = area.config_action or {}
    return bool(cfg.get("simulate", False))
