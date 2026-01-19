from django.core.management.base import BaseCommand
from automation.models import Service, Action, Reaction
from automation.providers.registry import ProviderRegistry
import importlib

class Command(BaseCommand):
    help = 'Initialize services, actions, and reactions from registered providers'

    def handle(self, *args, **options):
        # Ensure providers package is imported to trigger registration
        importlib.import_module('automation.providers')
        providers = ProviderRegistry.get_all_providers()
        
        for provider in providers:
            self.stdout.write(f"Initializing {provider.display_name}...")
            
            # Create or update Service
            service, created = Service.objects.update_or_create(
                name=provider.service_name,
                defaults={
                    'display_name': provider.display_name,
                    'icon_url': provider.icon_url
                }
            )
            
            # Sync Actions
            current_actions = []
            for action_data in provider.get_actions():
                action, _ = Action.objects.update_or_create(
                    service=service,
                    name=action_data['name'],
                    defaults={
                        'description': action_data['description']
                    }
                )
                current_actions.append(action.name)
            
            # Sync Reactions
            current_reactions = []
            for reaction_data in provider.get_reactions():
                reaction, _ = Reaction.objects.update_or_create(
                    service=service,
                    name=reaction_data['name'],
                    defaults={
                        'description': reaction_data['description']
                    }
                )
                current_reactions.append(reaction.name)
                
            self.stdout.write(self.style.SUCCESS(f"Successfully synced {provider.display_name}"))
