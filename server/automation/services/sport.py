import requests
import os
from automation.interfaces import IService, IAction
from automation.models import Area

class SportService(IService):
    slug = "sport"
    
    HEADERS = {
        'x-rapidapi-host': 'sportapi7.p.rapidapi.com',
        'x-rapidapi-key': os.environ.get('SPORT_RAPIDAPI_KEY')
    }

    @property
    def slug(self) -> str:
        return "sport"

class PlayerRatingTrigger(IAction):
    slug = "player_rating"
    
    @property
    def slug(self) -> str:
        return "player_rating"

    def check_trigger(self, params: dict, context: dict = None) -> bool:
        """
        Check if there are new ratings for a player in a season.
        params: {'player_id': '817181', 'tournament_id': '132', 'season_id': '65360'}
        """
        if not context or 'area_id' not in context:
            print("Error: No context provided for Sport trigger")
            return False

        area = Area.objects.get(id=context['area_id'])
        player_id = params.get('player_id', '')
        tournament_id = params.get('tournament_id', '')
        season_id = params.get('season_id', '')
        
        if not all([player_id, tournament_id, season_id]):
            return False

        url = f"https://sportapi7.p.rapidapi.com/api/v1/player/{player_id}/unique-tournament/{tournament_id}/season/{season_id}/ratings"
        
        try:
            response = requests.get(url, headers=SportService.HEADERS)
            response.raise_for_status()
            data = response.json()
            
            # Assuming 'data' contains a list of matches with ratings or an object with a 'ratings' list.
            # Common structure: {'ratings': [...]} or just [...]
            ratings_list = []
            if isinstance(data, list):
                ratings_list = data
            elif isinstance(data, dict):
                ratings_list = data.get('ratings', []) or data.get('matches', [])

            current_count = len(ratings_list)

            # Compare with last state
            last_count = area.trigger_state.get('rating_count', -1)
            
            # Update state
            area.trigger_state['rating_count'] = current_count
            area.save()

            if last_count == -1:
                # First run
                return False
            
            if current_count > last_count:
                return True
                
            return False

        except Exception as e:
            print(f"Sport API Error: {e}")
            return False
