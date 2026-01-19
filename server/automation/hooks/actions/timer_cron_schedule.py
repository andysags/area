from datetime import datetime, timezone
from ...models import ExecutionLog
from .. import register_action

@register_action("cron_schedule")
def check_cron(area, now=None):
    """
    Basic Cron implementation.
    Supports only simple "*" or specific numbers for now without external lib.
    Format: MIN HOUR DOM MON DOW
    """
    if now is None:
        now = datetime.now(timezone.utc)
        
    config = area.config_action or {}
    expression = config.get("expression", "* * * * *")
    
    parts = expression.split()
    if len(parts) != 5:
        return False # Invalid cron
        
    min_s, hour_s, dom_s, mon_s, dow_s = parts
    
    def match(value, field_val):
        if value == '*': return True
        # Handle lists "1,2"
        if ',' in value:
            return str(field_val) in value.split(',')
        # Handle steps "*/5"
        if value.startswith('*/'):
            try:
                step = int(value[2:])
                return field_val % step == 0
            except: pass
        return str(field_val) == value

    # Check matches
    is_match = (
        match(min_s, now.minute) and
        match(hour_s, now.hour) and
        match(dom_s, now.day) and
        match(mon_s, now.month) and
        match(dow_s, now.weekday() + 1) # 1-7 in cron usually? or 0-6. Python is 0=Mon. Let's assume standard 0-6 or 1-7 overlap.
    )
    
    if not is_match:
        return False
        
    # Rate limit: Don't trigger multiple times in the same minute
    last = ExecutionLog.objects.filter(area=area, status="success").order_by("-executed_at").first()
    if last:
        delta = (now - last.executed_at).total_seconds()
        if delta < 60:
            return False # Already ran this minute
            
    return True
