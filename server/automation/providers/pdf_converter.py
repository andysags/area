"""
PDF Converter Provider - Convert PDF documents to text
Uses public API: https://rapidapi.com/pdf-converter-api/api/pdf-converter-api
"""
from .base import BaseProvider
from .registry import ProviderRegistry
import requests
import os

@ProviderRegistry.register
class PDFConverterProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return "pdf_converter"
    
    @property
    def display_name(self) -> str:
        return "PDF Converter"
    
    @property
    def icon_url(self) -> str:
        return "https://cdn-icons-png.flaticon.com/512/337/337946.png"
    
    @property
    def requires_auth(self) -> bool:
        return False
    
    def get_actions(self):
        return []
    
    def get_reactions(self):
        return [
            {
                "name": "pdf_to_text",
                "display_name": "PDF vers Texte",
                "description": "Extract text from PDF document",
                "params": [
                    {
                        "name": "startPage",
                        "type": "number",
                        "label": "Start Page",
                        "default": 1
                    },
                    {
                        "name": "endPage",
                        "type": "number",
                        "label": "End Page",
                        "default": 1
                    }
                ],
                "handler": self.pdf_to_text
            }
        ]
    
    def pdf_to_text(self, params, context=None):
        start_page = params.get('startPage', 1)
        end_page = params.get('endPage', 1)
        pdf_data = params.get('pdf_data', b'') # In a real scenario, this would come from an action
        
        url = f"https://pdf-converter-api.p.rapidapi.com/PdfToText?startPage={start_page}&endPage={end_page}"
        headers = {
            'Content-Type': 'application/octet-stream',
            'x-rapidapi-host': 'pdf-converter-api.p.rapidapi.com',
            'x-rapidapi-key': os.environ.get('PDF_CONVERTER_RAPIDAPI_KEY')
        }

        try:
            response = requests.post(url, data=pdf_data, headers=headers)
            response.raise_for_status()
            return {"success": True, "text": response.text}
        except Exception as e:
            return {"success": False, "error": str(e)}
