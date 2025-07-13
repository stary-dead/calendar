from django.http import JsonResponse
from django.contrib.auth import login
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from allauth.socialaccount.models import SocialAccount
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
import json


@api_view(['GET'])
@permission_classes([AllowAny])  # Allow anonymous access
def oauth_status_view(request):
    """
    Check if OAuth is available and configured
    """
    from django.conf import settings
    
    google_configured = bool(
        getattr(settings, 'SOCIALACCOUNT_PROVIDERS', {})
        .get('google', {})
        .get('APP', {})
        .get('client_id', '')
    )
    
    github_configured = bool(
        getattr(settings, 'SOCIALACCOUNT_PROVIDERS', {})
        .get('github', {})
        .get('APP', {})
        .get('client_id', '')
    )
    
    return Response({
        'oauth_available': google_configured or github_configured,
        'providers': {
            'google': google_configured,
            'github': github_configured
        }
    })


@api_view(['GET'])
def social_accounts_view(request):
    """
    Get user's connected social accounts
    """
    if not request.user.is_authenticated:
        return Response({'accounts': []})
    
    accounts = SocialAccount.objects.filter(user=request.user)
    return Response({
        'accounts': [
            {
                'provider': account.provider,
                'uid': account.uid,
                'extra_data': {
                    'name': account.extra_data.get('name', ''),
                    'email': account.extra_data.get('email', ''),
                    'avatar_url': account.extra_data.get('avatar_url', ''),
                }
            }
            for account in accounts
        ]
    })


@csrf_exempt
@require_http_methods(["GET"])
def oauth_callback_view(request):
    """
    Handle OAuth callback and return user info for frontend
    """
    if request.user.is_authenticated:
        return JsonResponse({
            'success': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'is_staff': request.user.is_staff,
                'is_authenticated': True,
                'oauth_provider': get_user_oauth_provider(request.user)
            }
        })
    else:
        return JsonResponse({
            'success': False,
            'error': 'OAuth authentication failed'
        }, status=401)


def get_user_oauth_provider(user):
    """
    Get the OAuth provider for a user
    """
    try:
        social_account = SocialAccount.objects.filter(user=user).first()
        return social_account.provider if social_account else None
    except SocialAccount.DoesNotExist:
        return None
