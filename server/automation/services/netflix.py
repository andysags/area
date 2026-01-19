import requests
import os
from automation.interfaces import IService, IAction
from automation.models import Area

class NetflixService(IService):
    slug = "netflix"
    
    # In a real scenario, these headers might be dynamic or stored in env vars
    HEADERS = {
        'x-rapidapi-host': 'netflix54.p.rapidapi.com',
        'x-rapidapi-key': os.environ.get('NETFLIX_RAPIDAPI_KEY')
    }

    @property
    def slug(self) -> str:
        return "netflix"

class NewEpisodeTrigger(IAction):
    slug = "new_episode"
    
    @property
    def slug(self) -> str:
        return "new_episode"

    def check_trigger(self, params: dict, context: dict = None) -> bool:
        """
        Check if there are new episodes for the given series IDs.
        params: {'series_ids': 'id1,id2'}
        context: {'area_id': 123} - used to fetch/save state
        """
        if not context or 'area_id' not in context:
            print("Error: No context provided for Netflix trigger")
            return False

        area = Area.objects.get(id=context['area_id'])
        series_ids = params.get('series_ids', '')
        
        if not series_ids:
            return False

        url = "https://netflix54.p.rapidapi.com/season/episodes/"
        querystring = {
            "ids": series_ids,
            "offset": "0",
            "limit": "25",
            "lang": "en"
        }

        try:
            response = requests.get(url, headers=NetflixService.HEADERS, params=querystring)
            response.raise_for_status()
            data = response.json()
            
            # Use 'total' or count the items as the metric
            # The API response structure needs to be handled carefully.
            # Assuming data is a list of episodes or contains a count.
            # Based on common RapidAPI Netflix endpoints, it often returns a list.
            if isinstance(data, list):
                current_count = len(data)
            elif isinstance(data, dict):
                # Fallback if structure is different (some endpoints wrap in 'results')
                current_count = len(data.get('results', [])) if 'results' in data else len(data)
            else:
                current_count = 0

            # Compare with last state
            last_count = area.trigger_state.get('episode_count', -1) # -1 means first run
            
            # Update state
            area.trigger_state['episode_count'] = current_count
            area.save()

            if last_count == -1:
                # First run, don't trigger, just memorize
                return False
            
            if current_count > last_count:
                return True
                
            return False

        except Exception as e:
            print(f"Netflix API Error: {e}")
            return False
