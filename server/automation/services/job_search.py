import requests
import os
import json
from automation.interfaces import IService, IReaction

class JobSearchService(IService):
    slug = "job_search"
    
    HEADERS = {
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
        'x-rapidapi-key': os.environ.get('JOB_SEARCH_RAPIDAPI_KEY')
    }

    @property
    def slug(self) -> str:
        return "job_search"

class GetJobDetailsReaction(IReaction):
    slug = "get_job_details"
    
    @property
    def slug(self) -> str:
        return "get_job_details"

    def execute(self, params: dict) -> None:
        """
        Execute the reaction to get job details.
        params: {
            "job_id": "gcnkkB1_QjIlxbV9AAAAAA==",
            "country": "us"
        }
        """
        job_id = params.get('job_id')
        if not job_id:
            print("[JobSearch] Error: 'job_id' parameter is required.")
            return

        country = params.get('country', 'us')
        url = "https://jsearch.p.rapidapi.com/job-details"
        querystring = {"job_id": job_id, "country": country}

        try:
            print(f"[JobSearch] Fetching job details for ID: '{job_id}'...")
            response = requests.get(url, headers=JobSearchService.HEADERS, params=querystring)
            response.raise_for_status()
            
            result = response.json()
            print(f"[JobSearch] Success! Result:\n{json.dumps(result, indent=2)}")
            
            # Extract useful info if available
            if 'data' in result and isinstance(result['data'], list) and len(result['data']) > 0:
                job = result['data'][0]
                if 'job_title' in job:
                    print(f"[JobSearch] Job Title: {job['job_title']}")

        except Exception as e:
            print(f"[JobSearch] Error: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Response: {e.response.text}")
