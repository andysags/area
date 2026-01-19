"""
Contact Crawler Provider - Scrape contact information from websites
Uses public API: https://rapidapi.com/website-contacts-scraper/api/website-contacts-scraper
"""
from .base import BaseProvider
from .registry import ProviderRegistry
import requests
import os

@ProviderRegistry.register
class ContactCrawlerProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return "contact_crawler"
    
    @property
    def display_name(self) -> str:
        return "Contact Crawler"
    
    @property
    def icon_url(self) -> str:
        return "https://cdn-icons-png.flaticon.com/512/3095/3095321.png"
    
    @property
    def requires_auth(self) -> bool:
        return False
    
    def get_actions(self):
        return []
    
    def get_reactions(self):
        return [
            {
                "name": "scrape_contacts",
                "display_name": "Extraire Contacts",
                "description": "Extract contact information from a website domain",
                "params": [
                    {
                        "name": "domain",
                        "type": "text",
                        "label": "Website Domain",
                        "required": True,
                        "placeholder": "https://www.example.com"
                    }
                ],
                "handler": self.scrape_contacts
            }
        ]
    
    def scrape_contacts(self, params, context=None):
        domain = params.get('domain')
        payload = {"domain": domain}
        url = "https://website-contactcrawler.p.rapidapi.com/scrape"
        headers = {
            'Content-Type': 'application/json',
            'x-rapidapi-host': 'website-contactcrawler.p.rapidapi.com',
            'x-rapidapi-key': os.environ.get('CONTACT_CRAWLER_RAPIDAPI_KEY')
        }

        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return {"success": True, "data": response.json()}
        except Exception as e:
            return {"success": False, "error": str(e)}
