"""
Yahoo Finance Provider - Stock market news and data
Uses public API: https://rapidapi.com/sparior/api/yahoo-finance15
"""
from .base import BaseProvider
from .registry import ProviderRegistry
import requests
import os

@ProviderRegistry.register
class YahooFinanceProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return "yahoo_finance"
    
    @property
    def display_name(self) -> str:
        return "Yahoo Finance"
    
    @property
    def icon_url(self) -> str:
        return "https://cdn-icons-png.flaticon.com/512/5969/5969032.png"
    
    @property
    def requires_auth(self) -> bool:
        return False
    
    def get_actions(self):
        return []
    
    def get_reactions(self):
        return [
            {
                "name": "get_market_news",
                "display_name": "Obtenir Actualités Marché",
                "description": "Retrieve market news for specific stock tickers",
                "params": [
                    {
                        "name": "ticker",
                        "type": "text",
                        "label": "Ticker Symbols (comma separated)",
                        "required": True,
                        "placeholder": "AAPL,TSLA"
                    }
                ],
                "handler": self.get_market_news
            }
        ]
    
    def get_market_news(self, params, context=None):
        ticker = params.get('ticker')
        url = "https://yahoo-finance15.p.rapidapi.com/api/v1/markets/news"
        querystring = {"ticker": ticker}
        headers = {
            'x-rapidapi-host': 'yahoo-finance15.p.rapidapi.com',
            'x-rapidapi-key': os.environ.get('YAHOO_FINANCE_RAPIDAPI_KEY')
        }

        try:
            response = requests.get(url, headers=headers, params=querystring)
            response.raise_for_status()
            return {"success": True, "data": response.json()}
        except Exception as e:
            return {"success": False, "error": str(e)}
