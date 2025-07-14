from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import login, get_user_model
from allauth.socialaccount.models import SocialAccount


class CustomAccountAdapter(DefaultAccountAdapter):
    """
    Custom adapter for account operations
    """
    
    def is_open_for_signup(self, request):
        """
        Allow signup for OAuth users
        """
        return True


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Custom adapter for social account operations
    """
    
    def pre_social_login(self, request, sociallogin):
        """
        Перехватываем вход через социальные сети.
        Если пользователь с таким email уже существует, привязываем social аккаунт к нему.
        """
        user = sociallogin.user
        
        if user.id:
            # Пользователь уже существует (не новый), ничего не делаем
            return
        
        if not user.email:
            # Нет email - не можем найти существующего пользователя
            return
        
        User = get_user_model()
        
        try:
            # Ищем существующего пользователя по email
            existing_user = User.objects.get(email=user.email)
            
            # Проверяем, не привязан ли уже этот social аккаунт к другому пользователю
            if not SocialAccount.objects.filter(
                provider=sociallogin.account.provider,
                uid=sociallogin.account.uid
            ).exists():
                # Привязываем social аккаунт к существующему пользователю
                sociallogin.connect(request, existing_user)
                
        except User.DoesNotExist:
            # Пользователь не найден - позволяем создать нового
            pass
    
    def is_open_for_signup(self, request, sociallogin):
        """
        Allow signup via social accounts - всегда разрешаем
        """
        return True
    
    def is_auto_signup_allowed(self, request, sociallogin):
        """
        Автоматическая регистрация без формы
        """
        return True
    
    def populate_user(self, request, sociallogin, data):
        """
        Populate user data from social account
        """
        user = super().populate_user(request, sociallogin, data)
        
        # Ensure username is set from social account data
        if not user.username and sociallogin.account.extra_data:
            extra_data = sociallogin.account.extra_data
            
            # Try to get username from different providers
            if sociallogin.account.provider == 'google':
                user.username = extra_data.get('email', '').split('@')[0]
            elif sociallogin.account.provider == 'github':
                user.username = extra_data.get('login', '')
            
            # Fallback to email prefix if no username found
            if not user.username and user.email:
                user.username = user.email.split('@')[0]
                
        return user
    
    def save_user(self, request, sociallogin, form=None):
        """
        Save the user and auto-login
        """
        user = super().save_user(request, sociallogin, form)
        
        # Auto-login the user after successful OAuth
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        
        return user
