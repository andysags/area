from .. import register_reaction

@register_reaction("log")
def exec_log(area, context=None):
    # No external side effect, handled by engine which writes ExecutionLog
    return {"ok": True, "detail": area.config_reaction.get("message", "Triggered")}
