import base64
import hashlib
import uuid
from django.conf import settings
from django.db import models
from django.utils import timezone
from cryptography.fernet import Fernet
from django.contrib.auth import get_user_model

User = get_user_model()

def _fernet():
    # Derive a 32-byte key from SECRET_KEY (simple deterministic derivation)
    digest = hashlib.sha256(settings.SECRET_KEY.encode("utf-8")).digest()
    key = base64.urlsafe_b64encode(digest)
    return Fernet(key)

def encrypt_token(value: str) -> str:
    if not value:
        return ""
    return _fernet().encrypt(value.encode("utf-8")).decode("utf-8")

def decrypt_token(value: str) -> str:
    if not value:
        return ""
    try:
        return _fernet().decrypt(value.encode("utf-8")).decode("utf-8")
    except Exception:
        return ""

class Service(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=64, unique=True)
    display_name = models.CharField(max_length=128, default="")
    icon_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["name"])]

    def __str__(self):
        return self.name

    def get_provider(self):
        from .providers.registry import ProviderRegistry
        return ProviderRegistry.get_provider(self.name)

class UserService(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_services")
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="user_services")
    access_token_enc = models.TextField(blank=True)
    refresh_token_enc = models.TextField(blank=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    linked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "service")
        indexes = [models.Index(fields=["user", "service"])]

    def set_tokens(self, access: str, refresh: str = ""):
        self.access_token_enc = encrypt_token(access)
        self.refresh_token_enc = encrypt_token(refresh)

    def get_access_token(self) -> str:
        return decrypt_token(self.access_token_enc)

    def get_refresh_token(self) -> str:
        return decrypt_token(self.refresh_token_enc)

class Action(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="actions")
    name = models.CharField(max_length=128)  # internal identifier e.g. new_mail
    display_name = models.CharField(max_length=128, blank=True, default="")
    description = models.TextField(blank=True)

    class Meta:
        unique_together = ("service", "name")
        indexes = [models.Index(fields=["service", "name"])]

    def __str__(self):
        return f"{self.service.name}:{self.name}"

class Reaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="reactions")
    name = models.CharField(max_length=128)
    display_name = models.CharField(max_length=128, blank=True, default="")
    description = models.TextField(blank=True)

    class Meta:
        unique_together = ("service", "name")
        indexes = [models.Index(fields=["service", "name"])]

    def __str__(self):
        return f"{self.service.name}:{self.name}"

class Area(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="areas")
    action = models.ForeignKey(Action, on_delete=models.CASCADE, related_name="areas")
    reaction = models.ForeignKey(Reaction, on_delete=models.CASCADE, related_name="areas")
    # deprecated: use config_action & config_reaction instead
    config = models.JSONField(default=dict, blank=True)
    config_action = models.JSONField(default=dict, blank=True)
    config_reaction = models.JSONField(default=dict, blank=True)
    enabled = models.BooleanField(default=True)
    name = models.CharField(max_length=255, default="Untitled Area")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["user", "enabled"])]

    def __str__(self):
        return f"AREA {self.id} user={self.user_id} action={self.action_id} -> reaction={self.reaction_id}"

class ExecutionLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    area = models.ForeignKey(Area, on_delete=models.CASCADE, related_name="execution_logs")
    executed_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=32)  # success / error
    message = models.TextField(blank=True)

    class Meta:
        indexes = [models.Index(fields=["area", "executed_at"])]
        ordering = ["-executed_at"]

    def __str__(self):
        return f"Log {self.id} area={self.area_id} status={self.status}"

class Session(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sessions")
    refresh_token_hash = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    revoked = models.BooleanField(default=False)

    class Meta:
        indexes = [models.Index(fields=["user", "revoked"])]

    def set_refresh_token(self, token: str):
        self.refresh_token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()

    def matches(self, token: str) -> bool:
        return hashlib.sha256(token.encode("utf-8")).hexdigest() == self.refresh_token_hash
