from datetime import datetime, timezone
from ...models import ExecutionLog
from .. import register_action

@register_action("every_day")
def check_every_day(area, now=None):
    """
    Triggers once a day at the specified time.
    """
    if now is None:
        now = datetime.now(timezone.utc)
    
    config = area.config_action or {}
    target_time_str = config.get("time", "00:00")
    
    try:
        # Parse target time
        h, m = map(int, target_time_str.split(':'))
        
        # Check if current time is roughly matching target time (within 60s window if loop is slow)
        # OR simply check if we haven't run today AND it is past target time
        
        last = ExecutionLog.objects.filter(area=area, status="success").order_by("-executed_at").first()
        
        # If never run, run if current time >= target time
        current_minutes = now.hour * 60 + now.minute
        target_minutes = h * 60 + m
        
        if not last:
             return current_minutes >= target_minutes
             
        # If run previously
        # Check if last run was on a different day
        if last.executed_at.date() < now.date():
            # It's a new day, check if we passed the time
            return current_minutes >= target_minutes
            
        return False
        
    except Exception:
        return False
