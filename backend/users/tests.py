from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
import json


class AuthenticationTestCase(TestCase):
    """
    Тесты для системы аутентификации
    """
    
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )
        self.admin_user = User.objects.create_user(
            username='admin',
            password='adminpass123',
            email='admin@example.com',
            is_staff=True
        )

    def test_login_success(self):
        """Тест успешного логина"""
        response = self.client.post('/api/auth/login/', 
            data=json.dumps({
                'username': 'testuser',
                'password': 'testpass123'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['user']['username'], 'testuser')
        self.assertFalse(data['user']['is_staff'])

    def test_login_failure_wrong_password(self):
        """Тест неуспешного логина с неверным паролем"""
        response = self.client.post('/api/auth/login/', 
            data=json.dumps({
                'username': 'testuser',
                'password': 'wrongpass'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 401)
        data = response.json()
        self.assertFalse(data['success'])
        self.assertEqual(data['error'], 'Invalid credentials')

    def test_login_failure_missing_data(self):
        """Тест неуспешного логина с отсутствующими данными"""
        response = self.client.post('/api/auth/login/', 
            data=json.dumps({
                'username': 'testuser'
                # password отсутствует
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertFalse(data['success'])

    def test_user_info_authenticated(self):
        """Тест получения информации о залогиненном пользователе"""
        # Логинимся
        self.client.login(username='testuser', password='testpass123')
        
        response = self.client.get('/api/auth/user/')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['user']['username'], 'testuser')
        self.assertTrue(data['user']['is_authenticated'])

    def test_user_info_not_authenticated(self):
        """Тест получения информации о незалогиненном пользователе"""
        response = self.client.get('/api/auth/user/')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertFalse(data['success'])
        self.assertFalse(data['user']['is_authenticated'])

    def test_logout_success(self):
        """Тест успешного логаута"""
        # Логинимся
        self.client.login(username='testuser', password='testpass123')
        
        response = self.client.post('/api/auth/logout/')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])

    def test_logout_not_authenticated(self):
        """Тест логаута без аутентификации"""
        response = self.client.post('/api/auth/logout/')
        
        # Должен требовать аутентификацию
        self.assertEqual(response.status_code, 302)  # Redirect to login

    def test_admin_access_middleware(self):
        """Тест middleware для проверки админских прав"""
        # Обычный пользователь пытается получить доступ к админскому эндпоинту
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get('/api/admin/test/')
        
        self.assertEqual(response.status_code, 403)
        data = response.json()
        self.assertEqual(data['error'], 'Admin privileges required')

    def test_admin_access_success(self):
        """Тест успешного доступа админа к админскому эндпоинту"""
        # Админ получает доступ
        self.client.login(username='admin', password='adminpass123')
        response = self.client.get('/api/admin/test/')
        
        # Этот эндпоинт не существует, но middleware должен пропустить
        self.assertEqual(response.status_code, 404)  # Not 403

    def test_admin_access_no_auth(self):
        """Тест доступа к админскому эндпоинту без аутентификации"""
        response = self.client.get('/api/admin/test/')
        
        self.assertEqual(response.status_code, 401)
        data = response.json()
        self.assertEqual(data['error'], 'Authentication required')

    def test_register_success(self):
        """Тест успешной регистрации"""
        response = self.client.post('/api/auth/register/', 
            data=json.dumps({
                'username': 'newuser',
                'password': 'newpass123',
                'email': 'new@example.com'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['user']['username'], 'newuser')
        
        # Проверяем, что пользователь создался в БД
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_register_existing_username(self):
        """Тест регистрации с существующим именем пользователя"""
        response = self.client.post('/api/auth/register/', 
            data=json.dumps({
                'username': 'testuser',  # Уже существует
                'password': 'newpass123'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertFalse(data['success'])
        self.assertEqual(data['error'], 'Username already exists')
