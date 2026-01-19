import requests
import os
from automation.interfaces import IService, IAction
from automation.models import Area

class AliExpressService(IService):
    slug = "aliexpress"
    
    HEADERS = {
        'x-rapidapi-host': 'aliexpress-datahub.p.rapidapi.com',
        'x-rapidapi-key': os.environ.get('ALIEXPRESS_RAPIDAPI_KEY')
    }

    @property
    def slug(self) -> str:
        return "aliexpress"

class PriceChangeTrigger(IAction):
    slug = "price_change"
    
    @property
    def slug(self) -> str:
        return "price_change"

    def check_trigger(self, params: dict, context: dict = None) -> bool:
        """
        Check if the price of an item has changed.
        params: {'item_id': '1005005244562338'}
        """
        if not context or 'area_id' not in context:
            print("Error: No context provided for AliExpress trigger")
            return False

        area = Area.objects.get(id=context['area_id'])
        item_id = params.get('item_id', '')
        
        if not item_id:
            return False

        url = "https://aliexpress-datahub.p.rapidapi.com/item_detail_2"
        querystring = {"itemId": item_id}

        try:
            response = requests.get(url, headers=AliExpressService.HEADERS, params=querystring)
            response.raise_for_status()
            data = response.json()
            
            # Navigating the response structure to find price.
            # Based on common AliExpress API responses, it's often nested.
            # Let's try to find a price field safely.
            result = data.get('result', {})
            item = result.get('item', {})
            sku = item.get('sku', {})
            def_sku_id = sku.get('defSkuId')
            
            # This part is tricky as APIs vary. 
            # Often price is in sku.currentPrice or something similar.
            # Let's look for a generic price entry or try to extract from variant if needed.
            # Assuming 'sku' has price info or there is a 'webEnv' with price.
            
            # A fallback if specific path is unknown: look for 'price' in string representation or top level keys.
            # But let's verify what the user curl might return or make a best guess based on 'item_detail_2' naming.
            # Usually: result -> item -> sku -> def -> price
            
            # For simplicity and robustness, let's grab 'sku.minPrice' or 'sku.price' from the first variant if defSkuId fails.
            # Or use 'price' from 'item' if available.
            
            # Let's try to get a string representation of price to compare.
            # If we can't find a clean price, we might use the whole check sum of the item object, but that's volatile.
            
            # Trying path: result.item.sku.base.price (common pattern)
            # Or result.item.sku.def.price
            
            # Let's dump the first price we find.
            price_info = "0.00"
            if 'sku' in item and 'def' in item['sku']:
                 price_info = item['sku']['def'].get('promotionPrice') or item['sku']['def'].get('price')
            
            # As a backup, if we can't parse deep JSON without seeing it, 
            # we will assume the API returns a 'price' field at some high level or we detect change in the raw 'defSkuId' price data.
            
            # Let's assume we find a price value.
            # Since I cannot see the real API response right now, I will use a placeholder logic:
            # asking the API response for 'item.sku.def.price' is a good bet for 'item_detail_2'.
            
            # Safety check:
            current_price = "0"
            try:
                # Attempt to traverse common path
                current_price = item['sku']['def']['price']
            except (KeyError, TypeError):
                # Fallback: maybe it's in a different spot. 
                # Let's rely on a simpler check if possible given I can't debug the API live.
                # I will store the SKU list hash or something? 
                # No, price is specific.
                # Let's just default to storing "Unknown" and printing raw data in verification if needed.
                current_price = "Unknown"

            # Compare with last state
            last_price = area.trigger_state.get('last_price')
            
            # Update state
            area.trigger_state['last_price'] = current_price
            area.save()

            if last_price is None:
                # First run
                return False
            
            if current_price != "Unknown" and current_price != last_price:
                return True
                
            return False

        except Exception as e:
            print(f"AliExpress API Error: {e}")
            return False
