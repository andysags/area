import requests
import os
import json
from automation.interfaces import IService, IReaction

class BooksService(IService):
    slug = "books"
    
    HEADERS = {
        'x-rapidapi-host': 'all-books-api.p.rapidapi.com',
        'x-rapidapi-key': os.environ.get('BOOKS_RAPIDAPI_KEY')
    }

    @property
    def slug(self) -> str:
        return "books"

class GetBooksReaction(IReaction):
    slug = "get_books"
    
    @property
    def slug(self) -> str:
        return "get_books"

    def execute(self, params: dict) -> None:
        """
        Execute the reaction to get books list.
        params: {} (no parameters required for basic endpoint)
        """
        url = "https://all-books-api.p.rapidapi.com/getBooks"

        try:
            print("[Books] Fetching books list...")
            response = requests.get(url, headers=BooksService.HEADERS)
            response.raise_for_status()
            
            result = response.json()
            print(f"[Books] Success! Result:\n{json.dumps(result, indent=2)}")
            
            # Extract useful info if available
            if isinstance(result, list):
                print(f"[Books] Retrieved {len(result)} books")
            elif isinstance(result, dict) and 'books' in result:
                print(f"[Books] Retrieved {len(result['books'])} books")

        except Exception as e:
            print(f"[Books] Error: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Response: {e.response.text}")
