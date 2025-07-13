from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['user', 'time_slot', 'get_category', 'get_time_range', 'booked_at']
    list_filter = ['booked_at', 'time_slot__category', 'time_slot__start_time']
    search_fields = ['user__username', 'user__email', 'time_slot__category__name']
    readonly_fields = ['booked_at']
    date_hierarchy = 'booked_at'
    
    fieldsets = (
        ('Booking Details', {
            'fields': ('user', 'time_slot')
        }),
        ('Metadata', {
            'fields': ('booked_at',),
            'classes': ('collapse',)
        })
    )
    
    def get_category(self, obj):
        return obj.time_slot.category.name
    get_category.short_description = 'Category'
    get_category.admin_order_field = 'time_slot__category__name'
    
    def get_time_range(self, obj):
        return f"{obj.time_slot.start_time.strftime('%Y-%m-%d %H:%M')} - {obj.time_slot.end_time.strftime('%H:%M')}"
    get_time_range.short_description = 'Time Range'
    get_time_range.admin_order_field = 'time_slot__start_time'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'time_slot', 'time_slot__category')
