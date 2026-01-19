from django.core.management.base import BaseCommand
from django.utils import timezone
from time import sleep
import importlib

from automation.models import Area, ExecutionLog
from automation.hooks import action_checkers, reaction_executors

# Ensure built-in handlers are loaded
import automation.hooks.actions.timer  # noqa: F401
import automation.hooks.reactions.log  # noqa: F401
import automation.hooks.actions.gmail_new_email  # noqa: F401
import automation.hooks.reactions.gmail_send_email  # noqa: F401
import automation.hooks.actions.github_new_commit  # noqa: F401
import automation.hooks.actions.github_new_issue  # noqa: F401
import automation.hooks.actions.github_new_pull_request  # noqa: F401
import automation.hooks.reactions.github_create_issue  # noqa: F401
import automation.hooks.actions.discord_new_message  # noqa: F401
import automation.hooks.reactions.discord_send_message  # noqa: F401
import automation.hooks.actions.spotify_new_saved_track  # noqa: F401
import automation.hooks.reactions.spotify_add_to_playlist  # noqa: F401
import automation.hooks.actions.telegram_new_message  # noqa: F401
import automation.hooks.reactions.telegram_send_message  # noqa: F401
import automation.hooks.actions.twitter_new_tweet  # noqa: F401
import automation.hooks.reactions.twitter_post_tweet  # noqa: F401
import automation.hooks.actions.weatherapi_temperature_change  # noqa: F401
import automation.hooks.actions.aliexpress_price_change  # noqa: F401
import automation.hooks.actions.instagram_new_post  # noqa: F401
import automation.hooks.actions.anime_new_anime_airing  # noqa: F401
import automation.hooks.reactions.image_gen_generate_image  # noqa: F401
import automation.hooks.reactions.anime_get_anime_details  # noqa: F401
import automation.hooks.reactions.games_get_game_news  # noqa: F401
import automation.hooks.reactions.yahoo_finance_get_market_news  # noqa: F401
import automation.hooks.reactions.pdf_converter_pdf_to_text  # noqa: F401
import automation.hooks.reactions.job_search_get_job_details  # noqa: F401
import automation.hooks.reactions.contact_crawler_scrape_contacts  # noqa: F401
import automation.hooks.reactions.vehicle_detect_license_plate  # noqa: F401
import automation.hooks.reactions.spotify_dl_download_song  # noqa: F401
import automation.hooks.actions.timer_every_minute  # noqa: F401
import automation.hooks.actions.timer_every_hour  # noqa: F401
import automation.hooks.actions.timer_every_day  # noqa: F401
import automation.hooks.actions.timer_cron_schedule  # noqa: F401

class Command(BaseCommand):
    help = "Run Hook Engine loop to evaluate areas and execute reactions."

    def add_arguments(self, parser):
        parser.add_argument("--interval", type=int, default=15, help="Polling interval in seconds")
        parser.add_argument("--oneshot", action="store_true", help="Run a single iteration and exit")

    def handle(self, *args, **options):
        interval = options["interval"]
        oneshot = options["oneshot"]

        self.stdout.write(self.style.SUCCESS(f"Hook engine started (interval={interval}s, oneshot={oneshot})"))

        def iteration():
            now = timezone.now()
            areas = Area.objects.filter(enabled=True).select_related("action__service", "reaction__service", "user")
            for area in areas:
                act_type = (area.config_action or {}).get("type")
                react_type = (area.config_reaction or {}).get("type")

                checker = action_checkers.get(act_type)
                executor = reaction_executors.get(react_type)
                if not checker or not executor:
                    ExecutionLog.objects.create(
                        area=area,
                        executed_at=now,
                        status="error",
                        message=f"Missing handler (action={act_type}, reaction={react_type})",
                    )
                    continue

                try:
                    if checker(area, now=now):
                        # Build context with timestamp and any data from trigger
                        context = {"now": now.isoformat()}
                        
                        # If the action checker stored context data, merge it
                        if hasattr(area, '_trigger_context'):
                            context.update(area._trigger_context)
                        
                        result = executor(area, context=context)
                        detail = result.get("detail") if isinstance(result, dict) else str(result)
                        ExecutionLog.objects.create(
                            area=area,
                            executed_at=now,
                            status="success",
                            message=detail or "Reaction executed",
                        )
                except Exception as exc:
                    ExecutionLog.objects.create(
                        area=area,
                        executed_at=now,
                        status="error",
                        message=f"Exception: {exc}",
                    )

        if oneshot:
            iteration()
            return

        while True:
            iteration()
            sleep(interval)
