"""
Main URLs router for users app
Organized by role: Auth, User API, Admin API
"""
from django.urls import path, include

urlpatterns = [
    # Authentication endpoints (login, logout, register, user info)
    path('', include('users.auth_urls')),
    
    # OAuth endpoints (Google, GitHub, etc.)
    path('oauth/', include('users.oauth_urls')),
    
    # User API endpoints (categories, preferences, timeslots, bookings)
    path('', include('users.user_urls')),
    
    # Admin API endpoints (admin timeslots, admin bookings)
    path('admin/', include('users.admin_urls')),
]
