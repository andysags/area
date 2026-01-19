"""
Translate Provider - Free text translation
Uses public API: https://libretranslate.com (free tier)
"""
from .base import BaseProvider
from .registry import ProviderRegistry
import requests


@ProviderRegistry.register
class TranslateProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return "translate"
    
    @property
    def display_name(self) -> str:
        return "Translate"
    
    @property
    def icon_url(self) -> str:
        return "https://cdn-icons-png.flaticon.com/512/3898/3898082.png"

    @property
    def requires_auth(self) -> bool:
        return False
    
    def get_actions(self):
        """No triggers for translate - it's a reaction-only service"""
        return []
    
    def get_reactions(self):
        return [
            {
                "name": "translate_text",
                "display_name": "Traduire un Texte",
                "description": "Translate text from one language to another",
                "params": [
                    {
                        "name": "text",
                        "type": "textarea",
                        "label": "Text to Translate",
                        "required": True,
                        "placeholder": "Enter text to translate..."
                    },
                    {
                        "name": "source_lang",
                        "type": "select",
                        "label": "Source Language",
                        "required": True,
                        "options": [
                            {"id": "auto", "name": "Auto Detect"},
                            {"id": "en", "name": "English"},
                            {"id": "fr", "name": "French"},
                            {"id": "es", "name": "Spanish"},
                            {"id": "de", "name": "German"},
                            {"id": "it", "name": "Italian"},
                            {"id": "pt", "name": "Portuguese"},
                            {"id": "ru", "name": "Russian"},
                            {"id": "ja", "name": "Japanese"},
                            {"id": "zh", "name": "Chinese"},
                            {"id": "ar", "name": "Arabic"}
                        ]
                    },
                    {
                        "name": "target_lang",
                        "type": "select",
                        "label": "Target Language",
                        "required": True,
                        "options": [
                            {"id": "en", "name": "English"},
                            {"id": "fr", "name": "French"},
                            {"id": "es", "name": "Spanish"},
                            {"id": "de", "name": "German"},
                            {"id": "it", "name": "Italian"},
                            {"id": "pt", "name": "Portuguese"},
                            {"id": "ru", "name": "Russian"},
                            {"id": "ja", "name": "Japanese"},
                            {"id": "zh", "name": "Chinese"},
                            {"id": "ar", "name": "Arabic"}
                        ]
                    }
                ],
                "handler": self.translate_text
            },
            {
                "name": "detect_language",
                "display_name": "Détecter la Langue",
                "description": "Detect the language of a text",
                "params": [
                    {
                        "name": "text",
                        "type": "textarea",
                        "label": "Text",
                        "required": True
                    }
                ],
                "handler": self.detect_language
            }
        ]
    
    def translate_text(self, params, context=None):
        """Translate text using LibreTranslate public API"""
        text = params.get("text", "")
        source = params.get("source_lang", "auto")
        target = params.get("target_lang", "en")
        
        try:
            url = "https://libretranslate.com/translate"
            payload = {
                "q": text,
                "source": source,
                "target": target,
                "format": "text"
            }
            
            response = requests.post(url, json=payload, timeout=15)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                "success": True,
                "original_text": text,
                "translated_text": data.get("translatedText", ""),
                "source_lang": source,
                "target_lang": target,
                "detected_lang": data.get("detectedLanguage", {}).get("language") if source == "auto" else source
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def detect_language(self, params, context=None):
        """Detect language of text"""
        text = params.get("text", "")
        
        try:
            url = "https://libretranslate.com/detect"
            payload = {"q": text}
            
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            detections = data if isinstance(data, list) else []
            
            return {
                "success": True,
                "text": text,
                "detections": [
                    {
                        "language": d.get("language"),
                        "confidence": d.get("confidence")
                    }
                    for d in detections
                ]
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
