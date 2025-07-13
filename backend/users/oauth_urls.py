from django.urls import path
from . import oauth_views

urlpatterns = [
    path('status/', oauth_views.oauth_status_view, name='oauth_status'),
    path('accounts/', oauth_views.social_accounts_view, name='social_accounts'),
    path('callback/', oauth_views.oauth_callback_view, name='oauth_callback'),
]
