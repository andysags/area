import requests
import os
import json
from automation.interfaces import IService, IReaction

class PDFConverterService(IService):
    slug = "pdf_converter"
    
    HEADERS = {
        'Content-Type': 'application/octet-stream',
        'x-rapidapi-host': 'pdf-converter-api.p.rapidapi.com',
        'x-rapidapi-key': os.environ.get('PDF_CONVERTER_RAPIDAPI_KEY')
    }

    @property
    def slug(self) -> str:
        return "pdf_converter"

class PDFToTextReaction(IReaction):
    slug = "pdf_to_text"
    
    @property
    def slug(self) -> str:
        return "pdf_to_text"

    def execute(self, params: dict) -> None:
        """
        Execute the reaction to convert PDF to text.
        params: {
            "startPage": 0,
            "endPage": 0,
            "pdf_data": binary_data (optional for testing)
        }
        """
        start_page = params.get('startPage', 0)
        end_page = params.get('endPage', 0)
        pdf_data = params.get('pdf_data', b'')  # Binary PDF data
        
        url = f"https://pdf-converter-api.p.rapidapi.com/PdfToText?startPage={start_page}&endPage={end_page}"

        try:
            print(f"[PDFConverter] Converting PDF to text (pages {start_page}-{end_page})...")
            
            # Note: In a real scenario, pdf_data would be actual PDF binary content
            # For testing without actual PDF data, this will likely fail but demonstrates the pattern
            response = requests.post(url, data=pdf_data, headers=PDFConverterService.HEADERS)
            response.raise_for_status()
            
            result = response.text  # PDF converter likely returns plain text
            print(f"[PDFConverter] Success! Extracted text:\n{result}")

        except Exception as e:
            print(f"[PDFConverter] Error: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Response: {e.response.text}")
