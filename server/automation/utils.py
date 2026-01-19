from automation.services.netflix import NetflixService, NewEpisodeTrigger
from automation.services.anime import AnimeService, NewAnimeMatchingTrigger
from automation.services.aliexpress import AliExpressService, PriceChangeTrigger
from automation.services.sport import SportService, PlayerRatingTrigger
from automation.services.translate import TranslateService, TranslateJsonReaction
from automation.services.image_gen import ImageGenService, GenerateImageReaction
from automation.services.youtube import YouTubeService, GetMp3LinkReaction
from automation.interfaces import IService, IAction, IReaction

# Registry maps: slug -> class
SERVICES = {
    'netflix': NetflixService,
    'anime': AnimeService,
    'aliexpress': AliExpressService,
    'sport': SportService,
    'translate': TranslateService,
    'image_gen': ImageGenService,
    'youtube': YouTubeService,
}

ACTIONS = {
    'new_episode': NewEpisodeTrigger,
    'new_anime_matching': NewAnimeMatchingTrigger,
    'price_change': PriceChangeTrigger,
    'player_rating': PlayerRatingTrigger,
}

REACTIONS = {
    # We'll add the console/print reaction here for testing purposes if we had a file for it.
    # For now, let's just mock or add a generic one if needed.
    'translate_json': TranslateJsonReaction,
    'generate_image': GenerateImageReaction,
    'get_mp3_link': GetMp3LinkReaction,
}

def get_service_class(slug):
    return SERVICES.get(slug)

def get_action_class(slug):
    return ACTIONS.get(slug)

def get_reaction_class(slug):
    return REACTIONS.get(slug)

# Simple generic console reaction for testing
class ConsolePrintReaction(IReaction):
    slug = "print"
    def execute(self, params: dict) -> None:
        message = params.get('message', 'Default Message')
        print(f"[REACTION] Console Print: {message}")

REACTIONS['print'] = ConsolePrintReaction
