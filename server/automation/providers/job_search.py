"""
Job Search Provider - Search and retrieve job listings
Uses public API: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
"""
from .base import BaseProvider
from .registry import ProviderRegistry
import requests
import os

@ProviderRegistry.register
class JobSearchProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return "job_search"
    
    @property
    def display_name(self) -> str:
        return "Job Search"
    
    @property
    def icon_url(self) -> str:
        return "https://cdn-icons-png.flaticon.com/512/3850/3850285.png"
    
    @property
    def requires_auth(self) -> bool:
        return False
    
    def get_actions(self):
        return []
    
    def get_reactions(self):
        return [
            {
                "name": "get_job_details",
                "display_name": "Obtenir Détails Emploi",
                "description": "Retrieve detailed information about a specific job",
                "params": [
                    {
                        "name": "job_id",
                        "type": "text",
                        "label": "Job ID",
                        "required": True
                    },
                    {
                        "name": "country",
                        "type": "text",
                        "label": "Country (e.g., us)",
                        "default": "us"
                    }
                ],
                "handler": self.get_job_details
            }
        ]
    
    def get_job_details(self, params, context=None):
        job_id = params.get('job_id')
        country = params.get('country', 'us')
        url = "https://jsearch.p.rapidapi.com/job-details"
        querystring = {"job_id": job_id, "country": country}
        headers = {
            'x-rapidapi-host': 'jsearch.p.rapidapi.com',
            'x-rapidapi-key': os.environ.get('JOB_SEARCH_RAPIDAPI_KEY')
        }

        try:
            response = requests.get(url, headers=headers, params=querystring)
            response.raise_for_status()
            return {"success": True, "data": response.json()}
        except Exception as e:
            return {"success": False, "error": str(e)}
