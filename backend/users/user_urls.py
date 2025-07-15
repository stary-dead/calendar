"""
User API URLs
URL patterns for user-specific endpoints (timeslots, bookings)
"""
from django.urls import path
from . import user_views

urlpatterns = [
    # User API endpoints
    path('categories/', user_views.categories_list, name='user_categories'),
    path('timeslots/', user_views.timeslots_list, name='user_timeslots'),
    path('bookings/', user_views.create_booking, name='user_create_booking'),
    path('bookings/<int:booking_id>/', user_views.cancel_booking, name='user_cancel_booking'),
    path('user/bookings/', user_views.user_bookings, name='user_bookings_list'),
]
