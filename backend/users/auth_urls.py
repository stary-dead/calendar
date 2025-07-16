"""
Authentication URLs
URL patterns for auth endpoints (login, logout, register, user info)
"""
from django.urls import path
from . import auth_views

urlpatterns = [
    # CSRF token endpoint
    path('csrf/', auth_views.csrf_token_view, name='csrf_token'),
    
    # Authentication endpoints
    path('login/', auth_views.login_view, name='auth_login'),
    path('logout/', auth_views.logout_view, name='auth_logout'),
    path('register/', auth_views.register_view, name='auth_register'),
    path('user/', auth_views.user_info_view, name='auth_user_info'),
]
