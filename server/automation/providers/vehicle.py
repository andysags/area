"""
Vehicle Provider - Detect and lookup vehicle information
Uses public API: https://rapidapi.com/hermes-solutions/api/vehicle-database
"""
from .base import BaseProvider
from .registry import ProviderRegistry
import requests
import os

@ProviderRegistry.register
class VehicleProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return "vehicle"
    
    @property
    def display_name(self) -> str:
        return "Vehicle Database"
    
    @property
    def icon_url(self) -> str:
        return "https://cdn-icons-png.flaticon.com/512/3202/3202926.png"
    
    @property
    def requires_auth(self) -> bool:
        return False
    
    def get_actions(self):
        return []
    
    def get_reactions(self):
        return [
            {
                "name": "detect_license_plate",
                "display_name": "Détecter Plaque Immatriculation",
                "description": "Detect license plate information",
                "params": [],
                "handler": self.detect_license_plate
            }
        ]
    
    def detect_license_plate(self, params, context=None):
        url = "https://vehicle-database.p.rapidapi.com/lp-detect"
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-rapidapi-host': 'vehicle-database.p.rapidapi.com',
            'x-rapidapi-key': os.environ.get('VEHICLE_RAPIDAPI_KEY')
        }

        try:
            response = requests.post(url, headers=headers)
            response.raise_for_status()
            return {"success": True, "data": response.json()}
        except Exception as e:
            return {"success": False, "error": str(e)}
