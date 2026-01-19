from django.core.management.base import BaseCommand
from automation.models import Service, Action, Reaction
from automation.providers.registry import ProviderRegistry
from automation.apps import AutomationConfig # Triggers registration via ready() but might not be enough if run as command
# We need to manually register providers if not already done, but apps.ready() runs on startup.

class Command(BaseCommand):
    help = 'Syncs providers from code registry to database'

    def handle(self, *args, **kwargs):
        self.stdout.write("Syncing providers...")
        
        # Ensure providers are registered (importing apps.py logic or relying on Django app registry)
        # We can force import relevant modules just to be sure
        from automation.providers import github, google, discord, spotify, weatherapi, twitter, telegram
        
        # Manually register them if registry is empty (safety net)
        # But Validation: Registry should be populated by AppConfig.ready
        
        providers = ProviderRegistry.get_all_providers()
        self.stdout.write(f"Found {len(providers)} providers in registry.")

        for provider in providers:
            self.stdout.write(f"Processing {provider.service_name}...")
            
            service, created = Service.objects.get_or_create(
                name=provider.service_name,
                defaults={
                    'display_name': provider.display_name,
                    'icon_url': provider.icon_url,
                }
            )
            # Sync Actions
            for action_def in provider.get_actions():
                action, _ = Action.objects.update_or_create(
                    service=service,
                    name=action_def['name'],
                    defaults={
                        'display_name': action_def.get('display_name', action_def['name']),
                        'description': action_def.get('description', '')
                    }
                )
                self.stdout.write(f"  - Action: {action.display_name} ({action.name})")

            # Sync Reactions
            for reaction_def in provider.get_reactions():
                reaction, _ = Reaction.objects.update_or_create(
                    service=service,
                    name=reaction_def['name'],
                    defaults={
                        'display_name': reaction_def.get('display_name', reaction_def['name']),
                        'description': reaction_def.get('description', '')
                    }
                )
                self.stdout.write(f"  - Reaction: {reaction.display_name} ({reaction.name})")
        
        self.stdout.write(self.style.SUCCESS("Successfully synced all providers."))
