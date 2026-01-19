from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection, transaction
from io import StringIO

class Command(BaseCommand):
    help = 'Force apply socialaccount migrations by running raw SQL'

    def handle(self, *args, **options):
        migrations = [
            ('socialaccount', '0001_initial'),
            ('socialaccount', '0002_token_max_lengths'),
            ('socialaccount', '0003_extra_data_default_dict'),
            ('socialaccount', '0004_app_provider_id_settings'),
            ('socialaccount', '0005_socialtoken_nullable_app'),
            ('socialaccount', '0006_alter_socialaccount_extra_data'),
            ('sites', '0001_initial'),
            ('sites', '0002_alter_domain_unique'),
        ]

        cursor = connection.cursor()

        for app, migration_name in migrations:
            self.stdout.write(f"Processing {app} {migration_name}...")
            
            # 1. Check if we can get SQL
            out = StringIO()
            try:
                call_command('sqlmigrate', app, migration_name, stdout=out)
                sql = out.getvalue()
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to get SQL for {migration_name}: {e}"))
                continue

            if not sql.strip():
                self.stdout.write(f"No SQL for {migration_name}")
                continue

            # 2. Execute SQL
            # We wrap in try-except to ignore "already exists" errors if partial
            try:
                with transaction.atomic():
                    # Split widely to avoid massive blocks, though mostly safe
                    cursor.execute(sql)
                self.stdout.write(self.style.SUCCESS(f"Successfully ran SQL for {migration_name}"))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"SQL execution failed (might exist): {e}"))

        # 3. Fake all
        self.stdout.write("Faking migrations...")
        try:
            call_command('migrate', 'socialaccount', fake=True)
            self.stdout.write(self.style.SUCCESS("Faked socialaccount"))
        except Exception as e:
             self.stdout.write(self.style.ERROR(f"Failed to fake socialaccount: {e}"))
             
        try:
            call_command('migrate', 'sites', fake=True)
            self.stdout.write(self.style.SUCCESS("Faked sites"))
        except Exception as e:
             self.stdout.write(self.style.ERROR(f"Failed to fake sites: {e}"))

