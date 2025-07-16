"""
Authentication views
Views for login, logout, registration, and user info
"""
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from allauth.socialaccount.models import SocialAccount
import json


@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf_token_view(request):
    """
    Get CSRF token for frontend
    """
    return Response({
        'csrfToken': get_token(request)
    })


@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    """
    User login endpoint with OAuth account detection
    """
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return JsonResponse({
                'success': False,
                'error': 'Username and password are required'
            }, status=400)
        
        # Попытка аутентификации
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return JsonResponse({
                'success': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_staff': user.is_staff,
                    'is_authenticated': True
                }
            })
        else:
            # Проверяем, может ли это быть email вместо username
            try:
                if '@' in username:  # Пользователь ввел email
                    user_by_email = User.objects.get(email=username)
                    
                    # Проверяем, есть ли у пользователя social accounts
                    social_accounts = SocialAccount.objects.filter(user=user_by_email)
                    
                    if social_accounts.exists():
                        # У пользователя есть OAuth аккаунт - направляем на OAuth
                        providers = list(social_accounts.values_list('provider', flat=True))
                        return JsonResponse({
                            'success': False,
                            'error_type': 'oauth_only_account',
                            'error': f'This account was created with {", ".join(providers).title()}. Please sign in using OAuth.',
                            'email': username,
                            'available_providers': providers
                        }, status=401)
                
            except User.DoesNotExist:
                pass
            
            return JsonResponse({
                'success': False,
                'error': 'Invalid credentials'
            }, status=401)
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def logout_view(request):
    """
    User logout endpoint
    """
    if request.user.is_authenticated:
        logout(request)
    
    return JsonResponse({
        'success': True,
        'message': 'Logged out successfully'
    })


@require_http_methods(["GET"])
def user_info_view(request):
    """
    Get current user information
    """
    if request.user.is_authenticated:
        return JsonResponse({
            'success': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'is_staff': request.user.is_staff,
                'is_authenticated': True
            }
        })
    else:
        return JsonResponse({
            'success': False,
            'user': {
                'is_authenticated': False
            }
        })


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    User registration endpoint with OAuth account detection
    """
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')
        
        if not username or not password:
            return Response({
                'success': False,
                'error': 'Username and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Проверяем существование пользователя по username
        if User.objects.filter(username=username).exists():
            return Response({
                'success': False,
                'error': 'Username already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Проверяем существование пользователя по email
        if email and User.objects.filter(email=email).exists():
            existing_user = User.objects.get(email=email)
            
            # Проверяем, есть ли у этого пользователя social accounts
            social_accounts = SocialAccount.objects.filter(user=existing_user)
            
            if social_accounts.exists():
                # Пользователь зарегистрирован через OAuth - НЕ разрешаем обычную регистрацию
                providers = list(social_accounts.values_list('provider', flat=True))
                return Response({
                    'success': False,
                    'error_type': 'oauth_account_exists',
                    'error': f'Account with this email already exists and was created via {", ".join(providers).title()}. Please sign in using OAuth.',
                    'email': email,
                    'available_providers': providers
                }, status=status.HTTP_409_CONFLICT)
            else:
                # Пользователь уже зарегистрирован обычным способом
                return Response({
                    'success': False,
                    'error_type': 'regular_account_exists', 
                    'error': 'User with this email already exists. Please sign in with your password.',
                    'email': email
                }, status=status.HTTP_409_CONFLICT)
        
        # Создаем нового пользователя
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email
        )
        
        # Auto-login after registration with explicit backend
        user.backend = 'django.contrib.auth.backends.ModelBackend'
        login(request, user)
        
        return Response({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'is_authenticated': True
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
