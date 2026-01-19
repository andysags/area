import requests
import os
import json
from automation.interfaces import IService, IReaction

class VehicleService(IService):
    slug = "vehicle"
    
    HEADERS = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-rapidapi-host': 'vehicle-database.p.rapidapi.com',
        'x-rapidapi-key': os.environ.get('VEHICLE_RAPIDAPI_KEY')
    }

    @property
    def slug(self) -> str:
        return "vehicle"

class DetectLicensePlateReaction(IReaction):
    slug = "detect_license_plate"
    
    @property
    def slug(self) -> str:
        return "detect_license_plate"

    def execute(self, params: dict) -> None:
        """
        Execute the reaction to detect license plate information.
        params: {} (no specific params in the curl example)
        """
        url = "https://vehicle-database.p.rapidapi.com/lp-detect"

        try:
            print("[Vehicle] Detecting license plate...")
            response = requests.post(url, headers=VehicleService.HEADERS)
            response.raise_for_status()
            
            result = response.json()
            print(f"[Vehicle] Success! Result:\n{json.dumps(result, indent=2)}")

        except Exception as e:
            print(f"[Vehicle] Error: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Response: {e.response.text}")
