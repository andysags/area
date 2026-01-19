from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
import time
from django.shortcuts import get_object_or_404
from .models import Service, Action, Reaction, UserService, Area, ExecutionLog
from .providers.registry import ProviderRegistry
from .serializers import (
    ServiceSerializer, 
    ServiceListSerializer,
    ActionSerializer, 
    ReactionSerializer, 
    UserServiceSerializer,
    SubscribeSerializer,
    AreaSerializer,
    ExecutionLogSerializer,
)


class ServiceListView(generics.ListAPIView):
    """
    GET /services/
    List all available services with actions and reactions count
    """
    queryset = Service.objects.all()
    serializer_class = ServiceListSerializer
    permission_classes = [permissions.AllowAny]


class ServiceDetailView(generics.RetrieveAPIView):
    """
    GET /services/<id>/
    Get detailed information about a specific service including all actions and reactions
    """
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'


class ServiceActionsView(generics.ListAPIView):
    """
    GET /services/<id>/actions/
    List all actions for a specific service
    """
    serializer_class = ActionSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        service_id = self.kwargs.get('id')
        service = get_object_or_404(Service, id=service_id)
        return Action.objects.filter(service=service)


class ServiceReactionsView(generics.ListAPIView):
    """
    GET /services/<id>/reactions/
    List all reactions for a specific service
    """
    serializer_class = ReactionSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        service_id = self.kwargs.get('id')
        service = get_object_or_404(Service, id=service_id)
        return Reaction.objects.filter(service=service)


class ServiceSubscribeView(APIView):
    """
    POST /services/<id>/subscribe
    Subscribe to a service with OAuth tokens
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, id):
        service = get_object_or_404(Service, id=id)
        serializer = SubscribeSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {"error": {"code": "VALIDATION_ERROR", "message": "Invalid data", "details": serializer.errors}},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        access_token = serializer.validated_data.get('access_token')
        refresh_token = serializer.validated_data.get('refresh_token', '')
        expires_at = serializer.validated_data.get('expires_at')
        
        # Create or update subscription
        user_service, created = UserService.objects.update_or_create(
            user=request.user,
            service=service,
            defaults={
                'expires_at': expires_at,
            }
        )
        
        # Store encrypted tokens
        user_service.set_tokens(access_token, refresh_token)
        user_service.save()
        
        response_serializer = UserServiceSerializer(user_service)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class ServiceUnsubscribeView(APIView):
    """
    DELETE /services/<id>/unsubscribe
    Unsubscribe from a service
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, id):
        service = get_object_or_404(Service, id=id)
        
        try:
            user_service = UserService.objects.get(user=request.user, service=service)
            user_service.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except UserService.DoesNotExist:
            return Response(
                {"error": {"code": "NOT_SUBSCRIBED", "message": "You are not subscribed to this service"}},
                status=status.HTTP_404_NOT_FOUND
            )


class UserSubscriptionsView(generics.ListAPIView):
    """
    GET /services/subscriptions/
    List all services the user is subscribed to
    """
    serializer_class = UserServiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserService.objects.filter(user=self.request.user).select_related('service')


class AboutView(APIView):
    """
    GET /about.json
    Returns information about the server and available services
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        import time
        from .models import Service
        
        services_data = []
        services = Service.objects.prefetch_related('actions', 'reactions').all()

        for service in services:
            try:
                provider = ProviderRegistry.get_provider(service.name)
                print(f"[AboutView] Provider for {service.name}: {provider is not None}")
            except Exception as e:
                print(f"[AboutView] Failed to get provider for {service.name}: {e}")
                provider = None
            
            # Helper to get params from provider definition
            def get_params_for_action(action_name):
                try:
                    if not provider:
                        print(f"[AboutView] No provider for action {action_name}")
                        return []
                    actions = provider.get_actions()
                    print(f"[AboutView] Provider actions for {service.name}: {[a['name'] for a in actions]}")
                    for act in actions:
                        if act['name'] == action_name:
                            params = act.get('params', [])
                            print(f"[AboutView] Found params for {action_name}: {params}")
                            return params
                    print(f"[AboutView] Action {action_name} not found in provider")
                    return []
                except Exception as e:
                    print(f"[AboutView] Exception in get_params_for_action({action_name}): {e}")
                    return []

            def get_params_for_reaction(reaction_name):
                try:
                    if not provider: return []
                    for react in provider.get_reactions():
                        if react['name'] == reaction_name:
                            return react.get('params', [])
                    return []
                except Exception as e:
                    print(f"[AboutView] Exception in get_params_for_reaction({reaction_name}): {e}")
                    return []

            services_data.append({
                "name": service.name,
                "actions": [
                    {
                        "name": action.name, 
                        "description": action.description,
                        "params": get_params_for_action(action.name)
                    }
                    for action in service.actions.all()
                ],
                "reactions": [
                    {
                        "name": reaction.name, 
                        "description": reaction.description,
                        "params": get_params_for_reaction(reaction.name)
                    }
                    for reaction in service.reactions.all()
                ]
            })

        return Response({
            "client": {
                "host": request.META.get('REMOTE_ADDR')
            },
            "server": {
                "current_time": int(time.time()),
                "services": services_data
            }
        })


class AreaListCreateView(generics.ListCreateAPIView):
    """
    GET /areas/ -> list user areas
    POST /areas/ -> create area
    """
    serializer_class = AreaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Area.objects.filter(user=self.request.user).select_related('action', 'reaction')


class AreaDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /areas/<id>/ -> get area details
    PATCH /areas/<id>/ -> update area (enable/disable)
    DELETE /areas/<id>/ -> delete area
    """
    serializer_class = AreaSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Area.objects.filter(user=self.request.user)


class AreaLogsView(generics.ListAPIView):
    """
    GET /areas/logs/ -> list all logs accessible to user
    """
    serializer_class = ExecutionLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ExecutionLog.objects.filter(area__user=self.request.user).order_by('-executed_at')


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. Workflow Stats
        active_workflows = Area.objects.filter(user=user, enabled=True).count()
        inactive_workflows = Area.objects.filter(user=user, enabled=False).count()
        
        # 2. Execution Stats
        total_executions = ExecutionLog.objects.filter(area__user=user).count()
        
        # 3. Success Rate (Last 24h)
        last_24h = timezone.now() - timezone.timedelta(hours=24)
        recent_logs = ExecutionLog.objects.filter(area__user=user, executed_at__gte=last_24h)
        total_recent = recent_logs.count()
        if total_recent > 0:
            success_count = recent_logs.filter(status='success').count()
            success_rate = int((success_count / total_recent) * 100)
        else:
            success_rate = 100 # Default to 100% if no recent activity to avoid scary 0%
            
        # 4. Success Rate Trend (vs previous 24h) - Simplified for now
        # We could compare with the 24h before that, but let's keep it simple.
        
        return Response({
            "total_executions": total_executions,
            "active_workflows": active_workflows,
            "inactive_workflows": inactive_workflows,
            "success_rate": success_rate,
        })

from rest_framework import viewsets
from .models import Service, Action, Reaction, Area
from .serializers import ServiceSerializer, ActionSerializer, ReactionSerializer, AreaSerializer

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

class ActionViewSet(viewsets.ModelViewSet):
    queryset = Action.objects.all()
    serializer_class = ActionSerializer

class ReactionViewSet(viewsets.ModelViewSet):
    queryset = Reaction.objects.all()
    serializer_class = ReactionSerializer

class AreaViewSet(viewsets.ModelViewSet):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
