"""
Books Provider - Book search and information
Uses public API: https://openlibrary.org/dev/docs/api/search
"""
from .base import BaseProvider
from .registry import ProviderRegistry
import requests


@ProviderRegistry.register
class BooksProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return "books"
    
    @property
    def display_name(self) -> str:
        return "Books"
    
    @property
    def icon_url(self) -> str:
        return "https://cdn-icons-png.flaticon.com/512/2702/2702154.png"
    
    @property
    def requires_auth(self) -> bool:
        """Books API is public, no authentication required"""
        return False
    
    def get_actions(self):
        """No triggers for books - it's a reaction-only service"""
        return []
    
    def get_reactions(self):
        return [
            {
                "name": "search_books",
                "display_name": "Rechercher des Livres",
                "description": "Search for books by title, author, or ISBN",
                "params": [
                    {
                        "name": "query",
                        "type": "text",
                        "label": "Search Query",
                        "required": True,
                        "placeholder": "e.g., Harry Potter"
                    },
                    {
                        "name": "limit",
                        "type": "number",
                        "label": "Max Results",
                        "required": False,
                        "default": 10
                    }
                ],
                "handler": self.search_books
            },
            {
                "name": "get_book_by_isbn",
                "display_name": "Obtenir Livre par ISBN",
                "description": "Get book details by ISBN",
                "params": [
                    {
                        "name": "isbn",
                        "type": "text",
                        "label": "ISBN",
                        "required": True,
                        "placeholder": "e.g., 9780747532743"
                    }
                ],
                "handler": self.get_book_by_isbn
            }
        ]
    
    def search_books(self, params, context=None):
        """Search for books"""
        query = params.get("query", "")
        limit = params.get("limit", 10)
        
        try:
            url = f"https://openlibrary.org/search.json?q={query}&limit={limit}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            docs = data.get("docs", [])
            results = []
            
            for book in docs:
                results.append({
                    "title": book.get("title", "Unknown"),
                    "author": book.get("author_name", ["Unknown"])[0] if book.get("author_name") else "Unknown",
                    "first_publish_year": book.get("first_publish_year"),
                    "isbn": book.get("isbn", [""])[0] if book.get("isbn") else "",
                    "cover_id": book.get("cover_i"),
                    "publisher": book.get("publisher", [""])[0] if book.get("publisher") else "",
                    "language": book.get("language", [""])[0] if book.get("language") else ""
                })
            
            return {
                "success": True,
                "count": len(results),
                "total_found": data.get("numFound", 0),
                "results": results
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_book_by_isbn(self, params, context=None):
        """Get book details by ISBN"""
        isbn = params.get("isbn", "")
        
        try:
            url = f"https://openlibrary.org/isbn/{isbn}.json"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                "success": True,
                "title": data.get("title", "Unknown"),
                "subtitle": data.get("subtitle", ""),
                "publishers": data.get("publishers", []),
                "publish_date": data.get("publish_date", ""),
                "number_of_pages": data.get("number_of_pages"),
                "isbn_10": data.get("isbn_10", []),
                "isbn_13": data.get("isbn_13", []),
                "subjects": data.get("subjects", []),
                "url": f"https://openlibrary.org/isbn/{isbn}"
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
