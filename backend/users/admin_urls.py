"""
Admin API URLs
URL patterns for admin-only endpoints
"""
from django.urls import path
from . import admin_views

urlpatterns = [
    # Time slots management
    path('timeslots/', admin_views.admin_timeslots_list_create, name='admin_timeslots_list_create'),
    path('timeslots/<int:timeslot_id>/', admin_views.admin_timeslot_detail, name='admin_timeslot_detail'),
    
    # Bookings management  
    path('bookings/', admin_views.admin_bookings_list, name='admin_bookings_list'),
    path('bookings/<int:booking_id>/', admin_views.admin_cancel_booking, name='admin_cancel_booking'),
]
