import django.db.models.deletion
import django.utils.timezone
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Action',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('slug', models.SlugField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('config_schema', models.JSONField(blank=True, default=dict)),
            ],
        ),
        migrations.CreateModel(
            name='Reaction',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=128)),
                ('description', models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Area',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('config', models.JSONField(blank=True, default=dict)),
                ('enabled', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('action', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='areas', to='automation.action')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='areas', to=settings.AUTH_USER_MODEL)),
                ('reaction', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='areas', to='automation.reaction')),
            ],
        ),
        migrations.CreateModel(
            name='Service',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('slug', models.SlugField(max_length=100, unique=True)),
                ('description', models.TextField(blank=True)),
                ('icon_url', models.URLField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Area',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('is_active', models.BooleanField(default=True)),
                ('action_parameters', models.JSONField(blank=True, default=dict)),
                ('reaction_parameters', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('action', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='automation.action')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='areas', to=settings.AUTH_USER_MODEL)),
                ('reaction', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='automation.reaction')),
            ],
        ),
        migrations.AddField(
            model_name='reaction',
            name='service',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reactions', to='automation.service'),
        ),
        migrations.AddField(
            model_name='action',
            name='service',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='actions', to='automation.service'),
        ),
        migrations.CreateModel(
            name='Session',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('refresh_token_hash', models.CharField(max_length=128)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateTimeField(blank=True, null=True)),
                ('revoked', models.BooleanField(default=False)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sessions', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='UserService',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('access_token_enc', models.TextField(blank=True)),
                ('refresh_token_enc', models.TextField(blank=True)),
                ('expires_at', models.DateTimeField(blank=True, null=True)),
                ('linked_at', models.DateTimeField(auto_now_add=True)),
                ('service', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_services', to='automation.service')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_services', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='ExecutionLog',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('executed_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('status', models.CharField(max_length=32)),
                ('message', models.TextField(blank=True)),
                ('area', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='execution_logs', to='automation.area')),
            ],
            options={
                'ordering': ['-executed_at'],
                'indexes': [models.Index(fields=['area', 'executed_at'], name='automation__area_id_9acda9_idx')],
            },
        ),
        migrations.AddIndex(
            model_name='area',
            index=models.Index(fields=['user', 'enabled'], name='automation__user_id_89376d_idx'),
        ),
        migrations.AddIndex(
            model_name='reaction',
            index=models.Index(fields=['service', 'name'], name='automation__service_e997a4_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='reaction',
            unique_together={('service', 'name')},
        ),
        migrations.AddIndex(
            model_name='action',
            index=models.Index(fields=['service', 'name'], name='automation__service_509514_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='action',
            unique_together={('service', 'name')},
        ),
        migrations.AddIndex(
            model_name='session',
            index=models.Index(fields=['user', 'revoked'], name='automation__user_id_c66e8a_idx'),
        ),
        migrations.AddIndex(
            model_name='userservice',
            index=models.Index(fields=['user', 'service'], name='automation__user_id_d00643_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='userservice',
            unique_together={('user', 'service')},
        ),
    ]
