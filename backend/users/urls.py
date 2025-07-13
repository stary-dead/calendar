from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('user/', views.user_info_view, name='user_info'),
    path('register/', views.register_view, name='register'),
]
