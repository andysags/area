import requests
import os
import json
from automation.interfaces import IService, IReaction

class AIDetectionService(IService):
    slug = "ai_detection"
    
    HEADERS = {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'ai-detection4.p.rapidapi.com',
        'x-rapidapi-key': os.environ.get('AI_DETECTION_RAPIDAPI_KEY')
    }

    @property
    def slug(self) -> str:
        return "ai_detection"

class DetectAITextReaction(IReaction):
    slug = "detect_ai_text"
    
    @property
    def slug(self) -> str:
        return "detect_ai_text"

    def execute(self, params: dict) -> None:
        """
        Execute the reaction to detect AI-generated text.
        params: {
            "text": "Text to analyze...",
            "lang": "en"
        }
        """
        text = params.get('text')
        if not text:
            print("[AIDetection] Error: 'text' parameter is required.")
            return

        lang = params.get('lang', 'en')
        payload = {"text": text, "lang": lang}
        url = "https://ai-detection4.p.rapidapi.com/v1/ai-detection-rapid-api"

        try:
            print(f"[AIDetection] Analyzing text for AI detection (language: {lang})...")
            response = requests.post(url, json=payload, headers=AIDetectionService.HEADERS)
            response.raise_for_status()
            
            result = response.json()
            print(f"[AIDetection] Success! Result:\n{json.dumps(result, indent=2)}")
            
            # Extract useful info if available
            if 'ai_probability' in result:
                print(f"[AIDetection] AI Probability: {result['ai_probability']}")

        except Exception as e:
            print(f"[AIDetection] Error: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Response: {e.response.text}")
