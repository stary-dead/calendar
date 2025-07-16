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
        
        # Create test time slots using proper UTC format
        from datetime import datetime
        
        # Create time slots for tomorrow with proper UTC timezone
        tomorrow = (timezone.now() + timedelta(days=1)).date()
        
        # Create datetime objects in UTC format like "2025-07-16T07:00:00Z"
        start_time1 = datetime.fromisoformat(f"{tomorrow}T10:00:00+00:00")
        end_time1 = datetime.fromisoformat(f"{tomorrow}T11:00:00+00:00")
        
        start_time2 = datetime.fromisoformat(f"{tomorrow}T12:00:00+00:00")
        end_time2 = datetime.fromisoformat(f"{tomorrow}T13:00:00+00:00")
        
        # Make them timezone-aware
        start_time1 = timezone.make_aware(start_time1.replace(tzinfo=None), timezone.utc)
        end_time1 = timezone.make_aware(end_time1.replace(tzinfo=None), timezone.utc)
        start_time2 = timezone.make_aware(start_time2.replace(tzinfo=None), timezone.utc)
        end_time2 = timezone.make_aware(end_time2.replace(tzinfo=None), timezone.utc)
        
        self.timeslot1 = TimeSlot.objects.create(
            start_time=start_time1,
            end_time=end_time1,
            category=self.category1,
            created_by=self.admin_user
        )
        
        self.timeslot2 = TimeSlot.objects.create(
            start_time=start_time2,
            end_time=end_time2,
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
