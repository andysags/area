from datetime import datetime, timezone
from ...models import ExecutionLog
from .. import register_action

@register_action("timer")
def check_timer(area, now=None):
    """
    config_action: {"type":"timer", "interval_seconds": 60}
    Fires true when now - last_success >= interval.
    """
    cfg = area.config_action or {}
    interval = int(cfg.get("interval_seconds", 60))
    if now is None:
        now = datetime.now(timezone.utc)
    last = ExecutionLog.objects.filter(area=area, status="success").order_by("-executed_at").first()
    if not last:
        return True
    delta = (now - last.executed_at).total_seconds()
    return delta >= interval
