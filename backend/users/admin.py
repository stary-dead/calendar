from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserPreference


class UserPreferenceInline(admin.StackedInline):
    model = UserPreference
    can_delete = False
    verbose_name_plural = 'User Preferences'
    readonly_fields = ['created_at', 'updated_at', 'selected_categories']


class UserAdmin(BaseUserAdmin):
    inlines = (UserPreferenceInline,)


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'cat_1', 'cat_2', 'cat_3', 'get_selected_categories', 'updated_at']
    list_filter = ['cat_1', 'cat_2', 'cat_3', 'created_at', 'updated_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at', 'selected_categories']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Category Preferences', {
            'fields': ('cat_1', 'cat_2', 'cat_3')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'selected_categories'),
            'classes': ('collapse',)
        })
    )
    
    def get_selected_categories(self, obj):
        return ', '.join(obj.selected_categories) if obj.selected_categories else 'None'
    get_selected_categories.short_description = 'Selected Categories'


# Unregister the default User admin and register our custom one
admin.site.unregister(User)
admin.site.register(User, UserAdmin)
