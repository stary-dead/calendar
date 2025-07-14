"""
Unit tests for user API endpoints
Tests for user-specific endpoints including categories, preferences, timeslots, and bookings
"""
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth.models import User
from datetime import timedelta, date
from rest_framework import status

from .base import BaseAPITestCase
from bookings.models import Booking
from users.models import UserPreference
from events.models import TimeSlot


class CategoriesListTest(BaseAPITestCase):
    """Test categories list endpoint"""
    
    def test_get_categories_without_auth(self):
        """Test getting categories without authentication"""
        url = reverse('user_categories')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        category_names = [cat['name'] for cat in response.data]
        self.assertIn('Cat 1', category_names)
        self.assertIn('Cat 2', category_names)
        self.assertIn('Cat 3', category_names)


class UserPreferencesTest(BaseAPITestCase):
    """Test user preferences endpoint"""
    
    def test_get_preferences_authenticated(self):
        """Test getting user preferences when authenticated"""
        self.authenticate_user()
        url = reverse('user_preferences')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('cat_1', response.data)
        self.assertIn('cat_2', response.data)
        self.assertIn('cat_3', response.data)
    
    def test_get_preferences_unauthenticated(self):
        """Test getting user preferences without authentication"""
        url = reverse('user_preferences')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_update_preferences(self):
        """Test updating user preferences"""
        self.authenticate_user()
        url = reverse('user_preferences')
        
        data = {
            'cat_1': True,
            'cat_2': False,
            'cat_3': True
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['cat_1'])
        self.assertFalse(response.data['cat_2'])
        self.assertTrue(response.data['cat_3'])
        
        # Verify in database
        preferences = UserPreference.objects.get(user=self.regular_user)
        self.assertTrue(preferences.cat_1)
        self.assertFalse(preferences.cat_2)
        self.assertTrue(preferences.cat_3)


class TimeslotsListTest(BaseAPITestCase):
    """Test timeslots list endpoint"""
    
    def test_get_timeslots_authenticated(self):
        """Test getting timeslots when authenticated"""
        self.authenticate_user()
        url = reverse('user_timeslots')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_get_timeslots_unauthenticated(self):
        """Test getting timeslots without authentication"""
        url = reverse('user_timeslots')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_filter_timeslots_by_date(self):
        """Test filtering timeslots by date"""
        self.authenticate_user()
        url = reverse('user_timeslots')
        
        future_date = (timezone.now() + timedelta(days=1)).date()
        response = self.client.get(url, {'date': future_date.strftime('%Y-%m-%d')})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_filter_timeslots_by_category(self):
        """Test filtering timeslots by category"""
        self.authenticate_user()
        url = reverse('user_timeslots')
        
        response = self.client.get(url, {'categories': ['Cat 1']})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['category_name'], 'Cat 1')
    
    def test_filter_available_only(self):
        """Test filtering only available timeslots"""
        # Book one timeslot
        Booking.objects.create(user=self.regular_user, time_slot=self.timeslot1)
        
        self.authenticate_user()
        url = reverse('user_timeslots')
        
        response = self.client.get(url, {'available_only': 'true'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.timeslot2.id)
    
    def test_invalid_date_format(self):
        """Test invalid date format returns error"""
        self.authenticate_user()
        url = reverse('user_timeslots')
        
        response = self.client.get(url, {'date': 'invalid-date'})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid date format', response.data['error'])


class CreateBookingTest(BaseAPITestCase):
    """Test create booking endpoint"""
    
    def test_create_booking_authenticated(self):
        """Test creating booking when authenticated"""
        self.authenticate_user()
        url = reverse('user_create_booking')
        
        data = {'time_slot': self.timeslot1.id}
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['time_slot']['id'], self.timeslot1.id)
        
        # Verify booking exists in database
        self.assertTrue(Booking.objects.filter(
            user=self.regular_user,
            time_slot=self.timeslot1
        ).exists())
    
    def test_create_booking_unauthenticated(self):
        """Test creating booking without authentication"""
        url = reverse('user_create_booking')
        
        data = {'time_slot': self.timeslot1.id}
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_create_booking_already_booked(self):
        """Test creating booking for already booked timeslot"""
        # First booking
        Booking.objects.create(user=self.regular_user, time_slot=self.timeslot1)
        
        # Try to book the same slot with another user
        other_user = User.objects.create_user(
            username='otheruser',
            password='testpass123'
        )
        self.authenticate_user(other_user)
        
        url = reverse('user_create_booking')
        data = {'time_slot': self.timeslot1.id}
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_booking_nonexistent_timeslot(self):
        """Test creating booking for non-existent timeslot"""
        self.authenticate_user()
        url = reverse('user_create_booking')
        
        data = {'time_slot': 99999}
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CancelBookingTest(BaseAPITestCase):
    """Test cancel booking endpoint"""
    
    def setUp(self):
        super().setUp()
        self.booking = Booking.objects.create(
            user=self.regular_user,
            time_slot=self.timeslot1
        )
    
    def test_cancel_own_booking(self):
        """Test canceling own booking"""
        self.authenticate_user()
        url = reverse('user_cancel_booking', kwargs={'booking_id': self.booking.id})
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('cancelled successfully', response.data['message'])
        
        # Verify booking is deleted
        self.assertFalse(Booking.objects.filter(id=self.booking.id).exists())
    
    def test_cancel_booking_unauthenticated(self):
        """Test canceling booking without authentication"""
        url = reverse('user_cancel_booking', kwargs={'booking_id': self.booking.id})
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_cancel_other_user_booking(self):
        """Test canceling another user's booking"""
        other_user = User.objects.create_user(
            username='otheruser',
            password='testpass123'
        )
        self.authenticate_user(other_user)
        
        url = reverse('user_cancel_booking', kwargs={'booking_id': self.booking.id})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_cancel_nonexistent_booking(self):
        """Test canceling non-existent booking"""
        self.authenticate_user()
        url = reverse('user_cancel_booking', kwargs={'booking_id': 99999})
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class UserBookingsListTest(BaseAPITestCase):
    """Test user bookings list endpoint"""
    
    def setUp(self):
        super().setUp()
        # Create bookings
        self.booking1 = Booking.objects.create(
            user=self.regular_user,
            time_slot=self.timeslot1
        )
        self.booking2 = Booking.objects.create(
            user=self.regular_user,
            time_slot=self.timeslot2
        )
    
    def test_get_user_bookings_authenticated(self):
        """Test getting user bookings when authenticated"""
        self.authenticate_user()
        url = reverse('user_bookings_list')
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_get_user_bookings_unauthenticated(self):
        """Test getting user bookings without authentication"""
        url = reverse('user_bookings_list')
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_filter_upcoming_bookings(self):
        """Test filtering upcoming bookings"""
        self.authenticate_user()
        url = reverse('user_bookings_list')
        
        response = self.client.get(url, {'status': 'upcoming'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Both bookings should be upcoming since they're in the future
        self.assertEqual(len(response.data), 2)
    
    def test_only_own_bookings_returned(self):
        """Test that only user's own bookings are returned"""
        # Create another user with bookings
        other_user = User.objects.create_user(
            username='otheruser',
            password='testpass123'
        )
        
        # Create a future timeslot for the other user
        future_time = timezone.now() + timedelta(days=2)
        other_timeslot = TimeSlot.objects.create(
            start_time=future_time,
            end_time=future_time + timedelta(hours=1),
            category=self.category1,
            created_by=self.admin_user
        )
        
        Booking.objects.create(user=other_user, time_slot=other_timeslot)
        
        self.authenticate_user()
        url = reverse('user_bookings_list')
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Only regular_user's bookings
        
        # Verify these are actually the regular user's bookings
        for booking in response.data:
            # Check through database since user field is not in serializer
            db_booking = Booking.objects.get(id=booking['id'])
            self.assertEqual(db_booking.user.id, self.regular_user.id)
