import requests
import os
import json
from automation.interfaces import IService, IReaction

class ContactCrawlerService(IService):
    slug = "contact_crawler"
    
    HEADERS = {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'website-contactcrawler.p.rapidapi.com',
        'x-rapidapi-key': os.environ.get('CONTACT_CRAWLER_RAPIDAPI_KEY')
    }

    @property
    def slug(self) -> str:
        return "contact_crawler"

class ScrapeContactsReaction(IReaction):
    slug = "scrape_contacts"
    
    @property
    def slug(self) -> str:
        return "scrape_contacts"

    def execute(self, params: dict) -> None:
        """
        Execute the reaction to scrape contact information from a website.
        params: {
            "domain": "https://www.example.com/"
        }
        """
        domain = params.get('domain')
        if not domain:
            print("[ContactCrawler] Error: 'domain' parameter is required.")
            return

        payload = {"domain": domain}
        url = "https://website-contactcrawler.p.rapidapi.com/scrape"

        try:
            print(f"[ContactCrawler] Scraping contacts from: '{domain}'...")
            response = requests.post(url, json=payload, headers=ContactCrawlerService.HEADERS)
            response.raise_for_status()
            
            result = response.json()
            print(f"[ContactCrawler] Success! Result:\n{json.dumps(result, indent=2)}")

        except Exception as e:
            print(f"[ContactCrawler] Error: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Response: {e.response.text}")
