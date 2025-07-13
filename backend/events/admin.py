from django.contrib import admin
from .models import Category, TimeSlot


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name']
    readonly_fields = ['created_at']


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ['category', 'start_time', 'end_time', 'created_by', 'is_available', 'duration_minutes']
    list_filter = ['category', 'start_time', 'created_by']
    search_fields = ['category__name']
    readonly_fields = ['created_at', 'duration_minutes', 'is_available']
    date_hierarchy = 'start_time'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('category', 'created_by')
        }),
        ('Time Details', {
            'fields': ('start_time', 'end_time')
        }),
        ('Metadata', {
            'fields': ('created_at', 'duration_minutes', 'is_available'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('category', 'created_by')
