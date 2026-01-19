from rest_framework import serializers
from .models import Service, Action, Reaction, UserService, Area, ExecutionLog


class ActionSerializer(serializers.ModelSerializer):
    """Serializer for Action model"""
    service_name = serializers.CharField(source='service.name', read_only=True)
    params = serializers.SerializerMethodField()
    

    class Meta:
        model = Action
        fields = ['id', 'service', 'service_name', 'name', 'display_name', 'description', 'params']
        read_only_fields = ['id']

    def get_params(self, obj):
        from .providers.registry import ProviderRegistry
        provider = ProviderRegistry.get_provider(obj.service.name)
        if not provider:
            return []
        
        for action in provider.get_actions():
            if action['name'] == obj.name:
                return action.get('params', [])
        return []


class ReactionSerializer(serializers.ModelSerializer):
    """Serializer for Reaction model"""
    service_name = serializers.CharField(source='service.name', read_only=True)
    params = serializers.SerializerMethodField()
    
    class Meta:
        model = Reaction
        fields = ['id', 'service', 'service_name', 'name', 'display_name', 'description', 'params']
        read_only_fields = ['id']

    def get_params(self, obj):
        from .providers.registry import ProviderRegistry
        provider = ProviderRegistry.get_provider(obj.service.name)
        if not provider:
            return []
        
        for reaction in provider.get_reactions():
            if reaction['name'] == obj.name:
                return reaction.get('params', [])
        return []


class ServiceSerializer(serializers.ModelSerializer):
    """Serializer for Service model with nested actions and reactions"""
    actions = ActionSerializer(many=True, read_only=True)
    reactions = ReactionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Service
        fields = ['id', 'name', 'display_name', 'icon_url', 'created_at', 'actions', 'reactions']
        read_only_fields = ['id', 'created_at']


class ServiceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing services without nested data"""
    actions_count = serializers.SerializerMethodField()
    reactions_count = serializers.SerializerMethodField()
    is_connected = serializers.SerializerMethodField()
    requires_auth = serializers.SerializerMethodField()
    
    class Meta:
        model = Service
        fields = ['id', 'name', 'display_name', 'icon_url', 'actions_count', 'reactions_count', 'is_connected', 'requires_auth']
        read_only_fields = ['id']
    
    def get_actions_count(self, obj):
        provider = obj.get_provider()
        return len(provider.get_actions()) if provider else 0
    
    def get_reactions_count(self, obj):
        provider = obj.get_provider()
        return len(provider.get_reactions()) if provider else 0

    def get_is_connected(self, obj):
        # Auto-connected services
        if obj.name in ['timer', 'system', 'weatherapi']:
            return True

        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return UserService.objects.filter(user=request.user, service=obj).exists()
    
    def get_requires_auth(self, obj):
        """Check if the service requires OAuth authentication"""
        provider = obj.get_provider()
        if provider and hasattr(provider, 'requires_auth'):
            return provider.requires_auth
        return True  # Default to requiring auth for safety


class UserServiceSerializer(serializers.ModelSerializer):
    """Serializer for UserService (subscriptions)"""
    service = ServiceListSerializer(read_only=True)
    
    class Meta:
        model = UserService
        fields = ['id', 'service', 'expires_at', 'linked_at']
        read_only_fields = ['id', 'linked_at']


class SubscribeSerializer(serializers.Serializer):
    """Serializer for service subscription with OAuth tokens"""
    access_token = serializers.CharField(required=True)
    refresh_token = serializers.CharField(required=False, allow_blank=True)
    expires_at = serializers.DateTimeField(required=False, allow_null=True)


class ActionDetailSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)
    
    class Meta:
        model = Action
        fields = ['id', 'name', 'display_name', 'description', 'service']


class ReactionDetailSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)
    
    class Meta:
        model = Reaction
        fields = ['id', 'name', 'display_name', 'description', 'service']


class AreaSerializer(serializers.ModelSerializer):
    # Write-only fields for creation
    action_service_id = serializers.CharField(write_only=True, required=False)
    action_name = serializers.CharField(write_only=True, required=False)
    reaction_service_id = serializers.CharField(write_only=True, required=False)
    reaction_name = serializers.CharField(write_only=True, required=False)
    
    # Config fields mapping
    action_config = serializers.JSONField(source='config_action', required=False)
    reaction_config = serializers.JSONField(source='config_reaction', required=False)
    
    # Nested serializers for read operations
    action = ActionDetailSerializer(read_only=True)
    reaction = ReactionDetailSerializer(read_only=True)

    class Meta:
        model = Area
        fields = [
            'id', 'user', 'name', 'action', 'reaction', 'enabled', 'created_at', 'updated_at',
            'action_service_id', 'action_name', 'reaction_service_id', 'reaction_name',
            'action_config', 'reaction_config'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def create(self, validated_data):
        user = self.context['request'].user
        
        # Extract write-only fields
        action_service_name = validated_data.pop('action_service_id')
        action_name = validated_data.pop('action_name')
        reaction_service_name = validated_data.pop('reaction_service_id')
        reaction_name = validated_data.pop('reaction_name')
        
        # Resolve Action
        try:
            action_service = Service.objects.get(name=action_service_name)
            action = Action.objects.get(service=action_service, name=action_name)
        except (Service.DoesNotExist, Action.DoesNotExist):
            raise serializers.ValidationError(f"Action {action_name} for service {action_service_name} not found")
            
        # Resolve Reaction
        try:
            reaction_service = Service.objects.get(name=reaction_service_name)
            reaction = Reaction.objects.get(service=reaction_service, name=reaction_name)
        except (Service.DoesNotExist, Reaction.DoesNotExist):
            raise serializers.ValidationError(f"Reaction {reaction_name} for service {reaction_service_name} not found")
            
        validated_data['user'] = user
        validated_data['action'] = action
        validated_data['reaction'] = reaction
        
        # CRITICAL: Add 'type' field to configs for hook engine dispatch
        if 'config_action' in validated_data:
            validated_data['config_action']['type'] = action_name
        else:
            validated_data['config_action'] = {'type': action_name}
            
        if 'config_reaction' in validated_data:
            validated_data['config_reaction']['type'] = reaction_name
        else:
            validated_data['config_reaction'] = {'type': reaction_name}
        
        return super().create(validated_data)


class ExecutionLogSerializer(serializers.ModelSerializer):
    area_id = serializers.UUIDField(source='area.id', read_only=True)

    class Meta:
        model = ExecutionLog
        fields = ['id', 'area_id', 'executed_at', 'status', 'message']
        read_only_fields = fields
