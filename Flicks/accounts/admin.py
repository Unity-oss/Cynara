"""
Cynara Accounts Admin Configuration
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserPreferences


class UserPreferencesInline(admin.StackedInline):
    model = UserPreferences
    can_delete = False


class UserAdmin(BaseUserAdmin):
    inlines = (UserPreferencesInline,)


# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(UserPreferences)
class UserPreferencesAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'theme', 'default_quality', 'auto_play_next',
        'email_notifications', 'public_profile'
    )
    list_filter = (
        'theme', 'default_quality', 'auto_play_next', 
        'email_notifications', 'public_profile'
    )
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')
