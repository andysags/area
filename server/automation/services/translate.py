import requests
import os
import json
from automation.interfaces import IService, IReaction

class TranslateService(IService):
    slug = "translate"
    
    HEADERS = {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'translateai.p.rapidapi.com',
        'x-rapidapi-key': os.environ.get('TRANSLATE_RAPIDAPI_KEY')
    }

    @property
    def slug(self) -> str:
        return "translate"

class TranslateJsonReaction(IReaction):
    slug = "translate_json"
    
    @property
    def slug(self) -> str:
        return "translate_json"

    def execute(self, params: dict) -> None:
        """
        Execute the translation reaction.
        params: {
            "target_language": "bn", 
            "json_content": {...} or json_string
        }
        """
        target_language = params.get('target_language', 'fr')
        json_content = params.get('json_content', {})
        
        # If input is string, try to parse or use as is inside a structure
        if isinstance(json_content, str):
            try:
                json_content = json.loads(json_content)
            except:
                pass # Use as is if not valid json string

        # Construct payload matching the user's curl example
        payload = {
            "origin_language": "en", # Defaulting to EN for now, could be parameterized
            "target_language": target_language,
            "json_content": json_content
        }
        
        # Optional params from user curl example, making them optional here too
        if 'words_not_to_translate' in params:
            payload['words_not_to_translate'] = params['words_not_to_translate']
            
        url = "https://translateai.p.rapidapi.com/google/translate/json"

        try:
            print(f"[Translate] Sending request to translate to {target_language}...")
            response = requests.post(url, json=payload, headers=TranslateService.HEADERS)
            response.raise_for_status()
            
            result = response.json()
            print(f"[Translate] Success! Result:\n{json.dumps(result, indent=2)}")
            
            # In a real scenario, we might want to DO something with this result 
            # (e.g. save it, send it somewhere else). 
            # For now, printing it satisfies the "Reaction" contract of just executing.

        except Exception as e:
            print(f"[Translate] Error: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Response: {e.response.text}")
