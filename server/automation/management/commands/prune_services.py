from django.core.management.base import BaseCommand
from automation.models import Service
from automation.providers.registry import ProviderRegistry
import importlib

class Command(BaseCommand):
    help = "Prune services, actions, reactions not present in registered providers"

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Show what would be deleted without applying")

    def handle(self, *args, **options):
        importlib.import_module('automation.providers')
        provider_names = {p.service_name for p in ProviderRegistry.get_all_providers()}
        existing = list(Service.objects.values_list('name', flat=True))

        to_delete = [name for name in existing if name not in provider_names]
        if not to_delete:
            self.stdout.write(self.style.SUCCESS("No services to prune"))
            return

        self.stdout.write(f"Pruning services not in registry: {to_delete}")
        if options.get("dry_run"):
            return

        # Delete services cascades to actions/reactions/user_services/areas by FK
        Service.objects.filter(name__in=to_delete).delete()
        self.stdout.write(self.style.SUCCESS("Prune completed"))
