from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.base_user import BaseUserManager
from django.conf import settings
from django.utils import timezone
import random
import string

class UserManager(BaseUserManager):
    """
    Manager personnalisé pour CustomUser où l'email est l'identifiant unique.
    """
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    """
    User model personnalisé où l'email est l'identifiant unique.
    """
    username = None
    email = models.EmailField(_('email address'), unique=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    # Préférences de notifications
    notify_product_updates = models.BooleanField(default=True)
    notify_security_alerts = models.BooleanField(default=True)
    notify_marketing = models.BooleanField(default=False)
    
    # 2FA fields
    two_factor_enabled = models.BooleanField(default=False, help_text="Authentification à deux facteurs activée")
    two_factor_secret = models.CharField(max_length=32, blank=True, null=True, help_text="Secret TOTP pour 2FA")

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email


class NotificationPreferences(models.Model):
    """
    Préférences de notifications pour un utilisateur.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notification_preferences")
    product_updates = models.BooleanField(default=True, help_text="Recevoir des mises à jour du produit")
    security_alerts = models.BooleanField(default=True, help_text="Recevoir des alertes de sécurité (obligatoire)")
    marketing_emails = models.BooleanField(default=False, help_text="Recevoir des e-mails marketing")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Notification Preference"
        verbose_name_plural = "Notification Preferences"

    def __str__(self):
        return f"Preferences for {self.user.email}"


class OAuthAccount(models.Model):
    """
    Compte OAuth lié à un utilisateur interne.
    Stocke les tokens nécessaires pour appeler les APIs tierces.
    """
    PROVIDER_CHOICES = (
        ("google", "Google"),
        ("github", "GitHub"),
        ("facebook", "Facebook"),
        ("twitter", "Twitter"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="oauth_accounts")
    provider = models.CharField(max_length=32)
    external_user_id = models.CharField(max_length=128)
    access_token = models.TextField()
    refresh_token = models.TextField(blank=True, null=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    scopes = models.TextField(blank=True, null=True)
    added_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("provider", "external_user_id", "user")
        indexes = [
            models.Index(fields=["provider", "external_user_id"]),
        ]

    def __str__(self):
        return f"{self.provider}:{self.external_user_id} -> {self.user_id}"


class EmailVerificationCode(models.Model):
    """
    Code de vérification 2FA envoyé par email
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="verification_codes")
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.code} ({'used' if self.used else 'valid'})"
    
    def is_valid(self):
        """Vérifie si le code est toujours valide"""
        return not self.used and timezone.now() < self.expires_at
    
    @classmethod
    def generate_code(cls):
        """Génère un code à 6 chiffres"""
        return ''.join(random.choices(string.digits, k=6))
    
    @classmethod
    def create_for_user(cls, user):
        """Crée un nouveau code pour l'utilisateur"""
        code = cls.generate_code()
        expires_at = timezone.now() + timezone.timedelta(minutes=10)
        return cls.objects.create(
            user=user,
            code=code,
            expires_at=expires_at
        )


class UserSession(models.Model):
    """
    Session utilisateur pour tracker les connexions actives
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="active_sessions")
    session_key = models.CharField(max_length=255, unique=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    device_type = models.CharField(max_length=50, blank=True)  # desktop, mobile, tablet
    browser = models.CharField(max_length=100, blank=True)
    os = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=200, blank=True)  # City, Country
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-last_activity']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['session_key']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.browser} on {self.os} ({self.ip_address})"
    
    def is_current_session(self, session_key):
        """Vérifie si c'est la session actuelle"""
        return self.session_key == session_key
    
    @classmethod
    def create_or_update_session(cls, user, session_key, request):
        """Crée ou met à jour une session utilisateur"""
        from user_agents import parse
        
        user_agent_string = request.META.get('HTTP_USER_AGENT', '')
        user_agent = parse(user_agent_string)
        
        # Déterminer le type d'appareil
        if user_agent.is_mobile:
            device_type = 'mobile'
        elif user_agent.is_tablet:
            device_type = 'tablet'
        else:
            device_type = 'desktop'
        
        # Obtenir l'IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        
        session, created = cls.objects.update_or_create(
            user=user,
            session_key=session_key,
            defaults={
                'ip_address': ip_address,
                'user_agent': user_agent_string,
                'device_type': device_type,
                'browser': f"{user_agent.browser.family} {user_agent.browser.version_string}",
                'os': f"{user_agent.os.family} {user_agent.os.version_string}",
                'is_active': True,
            }
        )
        return session
