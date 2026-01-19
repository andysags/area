import requests
import os
import json
from automation.interfaces import IService, IReaction

class ImageGenService(IService):
    slug = "image_gen"
    
    HEADERS = {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'ai-text-to-image-generator-flux-free-api.p.rapidapi.com',
        'x-rapidapi-key': os.environ.get('IMAGE_GEN_RAPIDAPI_KEY')
    }

    @property
    def slug(self) -> str:
        return "image_gen"

class GenerateImageReaction(IReaction):
    slug = "generate_image"
    
    @property
    def slug(self) -> str:
        return "generate_image"

    def execute(self, params: dict) -> None:
        """
        Execute the image generation reaction.
        params: {
            "prompt": "iron man and spider man", 
            "style_id": 4, 
            "size": "1-1"
        }
        """
        prompt = params.get('prompt')
        if not prompt:
            print("[ImageGen] Error: 'prompt' parameter is required.")
            return

        payload = {
            "prompt": prompt,
            "style_id": params.get('style_id', 4),  # Defaulting to 4 as per curl example
            "size": params.get('size', "1-1")       # Defaulting to 1-1
        }
            
        url = "https://ai-text-to-image-generator-flux-free-api.p.rapidapi.com/aaaaaaaaaaaaaaaaaiimagegenerator/quick.php"

        try:
            print(f"[ImageGen] Generating image for prompt: '{prompt}'...")
            response = requests.post(url, json=payload, headers=ImageGenService.HEADERS)
            response.raise_for_status()
            
            # The API returns structured data, usually with a URL.
            result = response.json()
            
            # Assuming the result structure contains the image URL directly or in a field.
            # Based on similar APIs, let's print the whole result to be sure, or extract 'url' if obvious.
            # Printing full debug info first.
            print(f"[ImageGen] Success! Result:\n{json.dumps(result, indent=2)}")
            
            # If there's an obvious url, let's print it clearly
            if 'url' in result:
                print(f"[ImageGen] Image URL: {result['url']}")

        except Exception as e:
            print(f"[ImageGen] Error: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Response: {e.response.text}")
