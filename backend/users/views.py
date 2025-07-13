from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User
import json


@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    """
    User login endpoint
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


@login_required
@require_http_methods(["POST"])
def logout_view(request):
    """
    User logout endpoint
    """
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
@require_http_methods(["POST"])
def register_view(request):
    """
    User registration endpoint (for testing purposes)
    """
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        email = data.get('email', '')
        
        if not username or not password:
            return JsonResponse({
                'success': False,
                'error': 'Username and password are required'
            }, status=400)
        
        if User.objects.filter(username=username).exists():
            return JsonResponse({
                'success': False,
                'error': 'Username already exists'
            }, status=400)
        
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email
        )
        
        # Auto-login after registration
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
