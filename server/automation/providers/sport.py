"""
Sport Provider - Sports news and scores
Uses public API: https://www.thesportsdb.com/api.php (free tier)
"""
from .base import BaseProvider
from .registry import ProviderRegistry
import requests


@ProviderRegistry.register
class SportProvider(BaseProvider):
    @property
    def service_name(self) -> str:
        return "sport"
    
    @property
    def display_name(self) -> str:
        return "Sport"
    
    @property
    def icon_url(self) -> str:
        return "https://cdn-icons-png.flaticon.com/512/857/857418.png"

    @property
    def requires_auth(self) -> bool:
        return False
    
    def get_actions(self):
        """No triggers for sport - it's a reaction-only service"""
        return []
    
    def get_reactions(self):
        return [
            {
                "name": "search_team",
                "display_name": "Rechercher une Équipe",
                "description": "Search for a sports team",
                "params": [
                    {
                        "name": "team_name",
                        "type": "text",
                        "label": "Team Name",
                        "required": True,
                        "placeholder": "e.g., Arsenal, Lakers"
                    }
                ],
                "handler": self.search_team
            },
            {
                "name": "get_team_details",
                "display_name": "Obtenir Détails Équipe",
                "description": "Get detailed information about a team",
                "params": [
                    {
                        "name": "team_id",
                        "type": "text",
                        "label": "Team ID",
                        "required": True
                    }
                ],
                "handler": self.get_team_details
            },
            {
                "name": "get_league_table",
                "display_name": "Obtenir Classement Ligue",
                "description": "Get league standings",
                "params": [
                    {
                        "name": "league_id",
                        "type": "text",
                        "label": "League ID",
                        "required": True,
                        "placeholder": "e.g., 4328 (English Premier League)"
                    },
                    {
                        "name": "season",
                        "type": "text",
                        "label": "Season",
                        "required": True,
                        "placeholder": "e.g., 2023-2024"
                    }
                ],
                "handler": self.get_league_table
            }
        ]
    
    def search_team(self, params, context=None):
        """Search for a team"""
        team_name = params.get("team_name", "")
        
        try:
            url = f"https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t={team_name}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            teams = data.get("teams", [])
            
            if not teams:
                return {"success": True, "count": 0, "results": []}
            
            results = []
            for team in teams:
                results.append({
                    "id": team.get("idTeam"),
                    "name": team.get("strTeam"),
                    "sport": team.get("strSport"),
                    "league": team.get("strLeague"),
                    "stadium": team.get("strStadium"),
                    "badge": team.get("strTeamBadge"),
                    "description": team.get("strDescriptionEN", "")[:200]
                })
            
            return {
                "success": True,
                "count": len(results),
                "results": results
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_team_details(self, params, context=None):
        """Get team details"""
        team_id = params.get("team_id")
        
        try:
            url = f"https://www.thesportsdb.com/api/v1/json/3/lookupteam.php?id={team_id}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            teams = data.get("teams", [])
            
            if not teams:
                return {"success": False, "error": "Team not found"}
            
            team = teams[0]
            
            return {
                "success": True,
                "id": team.get("idTeam"),
                "name": team.get("strTeam"),
                "sport": team.get("strSport"),
                "league": team.get("strLeague"),
                "stadium": team.get("strStadium"),
                "location": team.get("strStadiumLocation"),
                "capacity": team.get("intStadiumCapacity"),
                "formed_year": team.get("intFormedYear"),
                "website": team.get("strWebsite"),
                "facebook": team.get("strFacebook"),
                "twitter": team.get("strTwitter"),
                "badge": team.get("strTeamBadge"),
                "description": team.get("strDescriptionEN", "")
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_league_table(self, params, context=None):
        """Get league standings"""
        league_id = params.get("league_id")
        season = params.get("season")
        
        try:
            url = f"https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l={league_id}&s={season}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            table = data.get("table", [])
            
            results = []
            for entry in table:
                results.append({
                    "rank": entry.get("intRank"),
                    "team": entry.get("strTeam"),
                    "played": entry.get("intPlayed"),
                    "wins": entry.get("intWin"),
                    "draws": entry.get("intDraw"),
                    "losses": entry.get("intLoss"),
                    "goals_for": entry.get("intGoalsFor"),
                    "goals_against": entry.get("intGoalsAgainst"),
                    "goal_difference": entry.get("intGoalDifference"),
                    "points": entry.get("intPoints")
                })
            
            return {
                "success": True,
                "league_id": league_id,
                "season": season,
                "count": len(results),
                "standings": results
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
