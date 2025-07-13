from django.http import JsonResponse
import re


class AdminRequiredMiddleware:
    """
    Middleware для проверки прав администратора для админских маршрутов
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        # Админские маршруты, требующие проверки прав
        self.admin_patterns = [
            r'^/api/admin/',
        ]

    def __call__(self, request):
        # Проверяем, является ли маршрут админским
        if self._is_admin_route(request.path):
            if not request.user.is_authenticated:
                return JsonResponse({
                    'error': 'Authentication required',
                    'detail': 'You must be logged in to access admin endpoints'
                }, status=401)
                
            if not request.user.is_staff:
                return JsonResponse({
                    'error': 'Admin privileges required',
                    'detail': 'You must have admin privileges to access this endpoint'
                }, status=403)

        response = self.get_response(request)
        return response
    
    def _is_admin_route(self, path):
        """
        Проверяет, является ли маршрут админским
        """
        for pattern in self.admin_patterns:
            if re.match(pattern, path):
                return True
        return False
