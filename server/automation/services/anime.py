import requests
import os
from automation.interfaces import IService, IAction
from automation.models import Area

class AnimeService(IService):
    slug = "anime"
    
    # Using environment variable for security
    HEADERS = {
        'x-rapidapi-host': 'anime-db.p.rapidapi.com',
        'x-rapidapi-key': os.environ.get('ANIME_RAPIDAPI_KEY')
    }

    @property
    def slug(self) -> str:
        return "anime"

class NewAnimeMatchingTrigger(IAction):
    slug = "new_anime_matching"
    
    @property
    def slug(self) -> str:
        return "new_anime_matching"

    def check_trigger(self, params: dict, context: dict = None) -> bool:
        """
        Check if the top anime matching the criteria has changed (or if a new one appeared).
        params: {'search': 'Fullmetal', 'genres': 'Fantasy,Drama'}
        """
        if not context or 'area_id' not in context:
            print("Error: No context provided for Anime trigger")
            return False

        area = Area.objects.get(id=context['area_id'])
        
        search_query = params.get('search', '')
        genres = params.get('genres', '')
        
        url = "https://anime-db.p.rapidapi.com/anime"
        querystring = {
            "page": "1",
            "size": "1", # We only need the top result to check for "newest" or "top matching"
            "search": search_query,
            "genres": genres,
            "sortBy": "ranking",
            "sortOrder": "asc"
        }

        try:
            response = requests.get(url, headers=AnimeService.HEADERS, params=querystring)
            response.raise_for_status()
            data = response.json()
            
            # The API returns 'data' list inside the response object
            results = data.get('data', [])
            
            if not results:
                return False

            top_anime = results[0]
            top_anime_id = top_anime.get('_id') # Assuming _id is the unique identifier
            
            # Compare with last state
            last_top_id = area.trigger_state.get('last_top_id')
            
            # Update state
            area.trigger_state['last_top_id'] = top_anime_id
            area.save()

            if last_top_id is None:
                # First run
                return False
            
            # If the ID on top has changed, we assume a change (e.g. new ranking or new entry if sorted by date)
            # Note: The user asked for "new anime matching". Sorting by 'ranking' (as in the curl) implies finding the best one.
            # If they wanted "newest", we should verify the sort order.
            # But enforcing strict adherence to the provided curl command:
            if top_anime_id != last_top_id:
                return True
                
            return False

        except Exception as e:
            print(f"Anime API Error: {e}")
            return False
