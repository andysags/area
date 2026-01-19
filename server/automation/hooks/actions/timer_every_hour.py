from datetime import datetime, timezone
from ...models import ExecutionLog
from .. import register_action

@register_action("every_hour")
def check_every_hour(area, now=None):
    """
    Triggers true if it hasn't run in the last 3600 seconds.
    """
    if now is None:
        now = datetime.now(timezone.utc)
        
    last = ExecutionLog.objects.filter(area=area, status="success").order_by("-executed_at").first()
    if not last:
        return True
        
    delta = (now - last.executed_at).total_seconds()
    return delta >= 3600
