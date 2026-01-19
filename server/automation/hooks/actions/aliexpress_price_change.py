from .. import register_action
import requests
import os
from django.core.cache import cache

@register_action("price_change")
def checker(area, now=None):
    """
    Check if the price of an item on AliExpress has changed.
    Params: item_id (string)
    """
    try:
        api_key = os.environ.get("ALIEXPRESS_RAPIDAPI_KEY")
        if not api_key:
            return False

        action_config = getattr(area, 'config_action', {}) or area.action_parameters or {}
        item_id = action_config.get('item_id')
        if not item_id:
            return False

        url = "https://aliexpress-datahub.p.rapidapi.com/item_detail_2"
        headers = {
            "x-rapidapi-host": "aliexpress-datahub.p.rapidapi.com",
            "x-rapidapi-key": api_key
        }
        params = {"itemId": item_id}
        
        response = requests.get(url, headers=headers, params=params)
        if response.status_code != 200:
            return False
            
        data = response.json()
        
        # Extract price (Best effort based on legacy analysis)
        # Assuming result->item->sku->def->price or similar
        current_price = "Unknown"
        try:
            result = data.get('result', {})
            item = result.get('item', {})
            sku = item.get('sku', {})
            
            # Try to find a valid price in the structure
            if 'def' in sku and 'promotionPrice' in sku['def']:
                current_price = sku['def']['promotionPrice']
            elif 'def' in sku and 'price' in sku['def']:
                current_price = sku['def']['price']
            elif 'base' in sku and 'price' in sku['base']: # Common alternative
                current_price = sku['base']['price']
                
        except Exception:
            pass
            
        if current_price == "Unknown":
            return False
            
        cache_key = f"aliexpress_last_price_{area.id}_{item_id}"
        last_price = cache.get(cache_key)
        
        if last_price is None:
            # First run, seed cache
            cache.set(cache_key, current_price, timeout=None)
            return False
            
        if current_price != last_price:
            cache.set(cache_key, current_price, timeout=None)
            
            if not hasattr(area, '_trigger_context'):
                area._trigger_context = {}
            
            area._trigger_context['item_id'] = item_id
            area._trigger_context['old_price'] = last_price
            area._trigger_context['new_price'] = current_price
            
            return True
            
        return False

    except Exception as e:
        print(f"Error in aliexpress_price_change: {e}")
        return False
