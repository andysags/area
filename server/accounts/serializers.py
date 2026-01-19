from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import OAuthAccount, NotificationPreferences

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    oauth_accounts = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'avatar', 'oauth_accounts', 
                  'notify_product_updates', 'notify_security_alerts', 'notify_marketing',
                  'two_factor_enabled')
        read_only_fields = ('id', 'oauth_accounts', 'two_factor_enabled')

    def get_oauth_accounts(self, obj):
        accounts = getattr(obj, 'oauth_accounts', []).all() if hasattr(obj, 'oauth_accounts') else []
        return [
            {"id": a.id, "provider": a.provider, "external_user_id": a.external_user_id}
            for a in accounts
        ]
    
    def validate_email(self, value):
        """Vérifie que l'email n'est pas déjà utilisé par un autre utilisateur"""
        if value:
            user = self.instance
            if User.objects.filter(email=value).exclude(pk=user.pk if user else None).exists():
                raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    pseudo = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name', 'pseudo')

    def create(self, validated_data):
        # Validation de mot de passe renforcée
        pwd = validated_data['password']
        errors = []
        if len(pwd) < 8:
            errors.append('Password must be at least 8 characters long.')
        if not any(c.islower() for c in pwd):
            errors.append('Password must contain at least one lowercase letter.')
        if not any(c.isupper() for c in pwd):
            errors.append('Password must contain at least one uppercase letter.')
        if not any(c.isdigit() for c in pwd):
            errors.append('Password must contain at least one digit.')
        import string as _string
        if not any(c in _string.punctuation for c in pwd):
            errors.append('Password must contain at least one special character.')
        if errors:
            raise serializers.ValidationError({'password': errors})

        # Map 'pseudo' to first_name to avoid changing DB schema (no username field).
        first_name_val = validated_data.get('pseudo') or validated_data.get('first_name', '')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name_val,
            last_name=validated_data.get('last_name', '')
        )
        return user


class OAuthAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = OAuthAccount
        fields = ('id', 'provider', 'external_user_id')


class OAuthLinkSerializer(serializers.Serializer):
    provider = serializers.CharField()
    external_user_id = serializers.CharField()
    access_token = serializers.CharField()
    refresh_token = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    expires_at = serializers.IntegerField(required=False)  # epoch seconds
    scopes = serializers.ListField(child=serializers.CharField(), required=False)

    def create(self, validated_data):
        user = self.context['request'].user
        expires_at = validated_data.get('expires_at')
        expires_dt = None
        if expires_at:
            from datetime import datetime, timezone
            expires_dt = datetime.fromtimestamp(expires_at, tz=timezone.utc)

        account, created = OAuthAccount.objects.update_or_create(
            user=user,
            provider=validated_data['provider'],
            external_user_id=validated_data['external_user_id'],
            defaults={
                'access_token': validated_data['access_token'],
                'refresh_token': validated_data.get('refresh_token'),
                'expires_at': expires_dt,
                'scopes': ','.join(validated_data.get('scopes', [])) if validated_data.get('scopes') else None,
            }
        )
        return account


class OAuthLinkSerializer(serializers.ModelSerializer):
    provider = serializers.ChoiceField(choices=("google", "github", "facebook", "twitter"))
    external_user_id = serializers.CharField()
    access_token = serializers.CharField()
    refresh_token = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    expires_at = serializers.DateTimeField(required=False, allow_null=True)
    scopes = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = OAuthAccount
        fields = (
            'provider', 'external_user_id', 'access_token', 'refresh_token', 'expires_at', 'scopes'
        )

    def create(self, validated_data):
        user = self.context['request'].user
        # Empêcher les doublons pour le même user/provider/external_user_id
        account, created = OAuthAccount.objects.update_or_create(
            user=user,
            provider=validated_data['provider'],
            external_user_id=validated_data['external_user_id'],
            defaults={
                'access_token': validated_data['access_token'],
                'refresh_token': validated_data.get('refresh_token'),
                'expires_at': validated_data.get('expires_at'),
                'scopes': validated_data.get('scopes'),
            }
        )
        return account


class NotificationPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreferences
        fields = ('product_updates', 'security_alerts', 'marketing_emails')
        read_only_fields = ('security_alerts',)  # Les alertes de sécurité sont toujours activées
