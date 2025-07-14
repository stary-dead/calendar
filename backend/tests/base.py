"""
Base test utilities and fixtures
"""
from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APITestCase, APIClient

from events.models import Category, TimeSlot
from bookings.models import Booking
from users.models import UserPreference


class BaseAPITestCase(APITestCase):
    """Base test case with common setup for API tests"""
    
    def setUp(self):
        """Set up test data"""
        # Create test users
        self.regular_user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
        
        # Create categories
        self.category1 = Category.objects.create(name='Cat 1')
        self.category2 = Category.objects.create(name='Cat 2')
        self.category3 = Category.objects.create(name='Cat 3')
        
        # Create test time slots
        now = timezone.now()
        future_time = now + timedelta(days=1)
        
        self.timeslot1 = TimeSlot.objects.create(
            start_time=future_time,
            end_time=future_time + timedelta(hours=1),
            category=self.category1,
            created_by=self.admin_user
        )
        
        self.timeslot2 = TimeSlot.objects.create(
            start_time=future_time + timedelta(hours=2),
            end_time=future_time + timedelta(hours=3),
            category=self.category2,
            created_by=self.admin_user
        )
    
    def authenticate_user(self, user=None):
        """Authenticate as regular user or specified user"""
        if user is None:
            user = self.regular_user
            password = 'testpass123'
        else:
            password = 'testpass123'  # Assume same password for test users
        
        # Use login instead of force_authenticate to work with middleware
        self.client.login(username=user.username, password=password)
    
    def authenticate_admin(self):
        """Authenticate as admin user"""
        # Use login instead of force_authenticate to work with middleware
        self.client.login(username=self.admin_user.username, password='adminpass123')
    
    def clear_auth(self):
        """Clear authentication"""
        self.client.logout()
