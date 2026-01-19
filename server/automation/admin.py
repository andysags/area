from django.contrib import admin
from .models import Service, Action, Reaction, Area

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Action)
class ActionAdmin(admin.ModelAdmin):
    list_display = ('name', 'service')
    list_filter = ('service',)

@admin.register(Reaction)
class ReactionAdmin(admin.ModelAdmin):
    list_display = ('name', 'service')
    list_filter = ('service',)

@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'action', 'reaction', 'enabled')
    list_filter = ('enabled',)
    search_fields = ('name', 'user__email')
    
    def service__name(self, obj):
        return obj.action.service.name
