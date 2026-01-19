import requests
import os
import json
from automation.interfaces import IService, IReaction

class YahooFinanceService(IService):
    slug = "yahoo_finance"
    
    HEADERS = {
        'x-rapidapi-host': 'yahoo-finance15.p.rapidapi.com',
        'x-rapidapi-key': os.environ.get('YAHOO_FINANCE_RAPIDAPI_KEY')
    }

    @property
    def slug(self) -> str:
        return "yahoo_finance"

class GetMarketNewsReaction(IReaction):
    slug = "get_market_news"
    
    @property
    def slug(self) -> str:
        return "get_market_news"

    def execute(self, params: dict) -> None:
        """
        Execute the reaction to get market news.
        params: {
            "ticker": "AAPL,TSLA" (comma-separated stock symbols)
        }
        """
        ticker = params.get('ticker')
        if not ticker:
            print("[YahooFinance] Error: 'ticker' parameter is required.")
            return

        url = "https://yahoo-finance15.p.rapidapi.com/api/v1/markets/news"
        querystring = {"ticker": ticker}

        try:
            print(f"[YahooFinance] Fetching market news for: '{ticker}'...")
            response = requests.get(url, headers=YahooFinanceService.HEADERS, params=querystring)
            response.raise_for_status()
            
            result = response.json()
            print(f"[YahooFinance] Success! Result:\n{json.dumps(result, indent=2)}")
            
            # Extract useful info if available
            if 'body' in result and isinstance(result['body'], list):
                news_count = len(result['body'])
                print(f"[YahooFinance] Retrieved {news_count} news articles")

        except Exception as e:
            print(f"[YahooFinance] Error: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Response: {e.response.text}")
