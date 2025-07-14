"""
Authentication URLs
URL patterns for auth endpoints (login, logout, register, user info)
"""
from django.urls import path
from . import auth_views

urlpatterns = [
    # Authentication endpoints
    path('login/', auth_views.login_view, name='auth_login'),
    path('logout/', auth_views.logout_view, name='auth_logout'),
    path('register/', auth_views.register_view, name='auth_register'),
    path('user/', auth_views.user_info_view, name='auth_user_info'),
]
