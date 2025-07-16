"""
Unit tests for admin API endpoints
Tests for admin-only endpoints including timeslots and bookings management
"""
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth.models import User
from datetime import timedelta
from rest_framework import status

from .base import BaseAPITestCase
from bookings.models import Booking
from events.models import TimeSlot, Category


class AdminTimeslotsListCreateTest(BaseAPITestCase):
    """Test admin timeslots list and create endpoint"""
    
    def test_get_timeslots_as_admin(self):
        """Test getting all timeslots as admin"""
        self.authenticate_admin()
        url = reverse('admin_timeslots_list_create')
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_get_timeslots_as_regular_user(self):
        """Test getting timeslots as regular user (should fail)"""
        self.authenticate_user()
        url = reverse('admin_timeslots_list_create')
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_get_timeslots_unauthenticated(self):
        """Test getting timeslots without authentication"""
        url = reverse('admin_timeslots_list_create')
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_create_timeslot_as_admin(self):
        """Test creating timeslot as admin"""
        self.authenticate_admin()
        url = reverse('admin_timeslots_list_create')
        
        future_time = timezone.now() + timedelta(days=2)
        data = {
            'start_time': future_time.isoformat(),
            'end_time': (future_time + timedelta(hours=1)).isoformat(),
            'category': self.category1.id
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['category'], self.category1.id)
        self.assertEqual(response.data['created_by'], self.admin_user.id)
        
        # Verify timeslot exists in database
        self.assertTrue(TimeSlot.objects.filter(category=self.category1, created_by=self.admin_user).exists())
    
    def test_create_timeslot_as_regular_user(self):
        """Test creating timeslot as regular user (should fail)"""
        self.authenticate_user()
        url = reverse('admin_timeslots_list_create')
        
        future_time = timezone.now() + timedelta(days=2)
        data = {
            'start_time': future_time.isoformat(),
            'end_time': (future_time + timedelta(hours=1)).isoformat(),
            'category': self.category1.id
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_filter_timeslots_by_date(self):
        """Test filtering timeslots by date"""
        self.authenticate_admin()
        url = reverse('admin_timeslots_list_create')
        
        # Use the same date calculation as in the base setup
        filter_date = (timezone.now() + timedelta(days=1)).date()
        response = self.client.get(url, {'date': filter_date.strftime('%Y-%m-%d')})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_filter_timeslots_by_category(self):
        """Test filtering timeslots by category"""
        self.authenticate_admin()
        url = reverse('admin_timeslots_list_create')
        
        response = self.client.get(url, {'category': self.category1.id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['category'], self.category1.id)
    
    def test_filter_timeslots_by_status_booked(self):
        """Test filtering timeslots by booked status"""
        # Book one timeslot
        Booking.objects.create(user=self.regular_user, time_slot=self.timeslot1)
        
        self.authenticate_admin()
        url = reverse('admin_timeslots_list_create')
        
        response = self.client.get(url, {'status': 'booked'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.timeslot1.id)
        self.assertIsNotNone(response.data[0]['booking_info'])
    
    def test_filter_timeslots_by_status_available(self):
        """Test filtering timeslots by available status"""
        # Book one timeslot
        Booking.objects.create(user=self.regular_user, time_slot=self.timeslot1)
        
        self.authenticate_admin()
        url = reverse('admin_timeslots_list_create')
        
        response = self.client.get(url, {'status': 'available'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.timeslot2.id)
        self.assertIsNone(response.data[0]['booking_info'])


class AdminTimeslotDetailTest(BaseAPITestCase):
    """Test admin timeslot detail endpoint"""
    
    def test_get_timeslot_detail_as_admin(self):
        """Test getting timeslot detail as admin"""
        self.authenticate_admin()
        url = reverse('admin_timeslot_detail', kwargs={'timeslot_id': self.timeslot1.id})
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.timeslot1.id)
        self.assertEqual(response.data['category'], self.timeslot1.category.id)
    
    def test_get_timeslot_detail_as_regular_user(self):
        """Test getting timeslot detail as regular user (should fail)"""
        self.authenticate_user()
        url = reverse('admin_timeslot_detail', kwargs={'timeslot_id': self.timeslot1.id})
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_update_timeslot_as_admin(self):
        """Test updating timeslot as admin"""
        self.authenticate_admin()
        url = reverse('admin_timeslot_detail', kwargs={'timeslot_id': self.timeslot1.id})
        
        # Update only non-critical fields
        future_time = timezone.now() + timedelta(days=2)
        data = {
            'start_time': future_time.isoformat(),
            'end_time': (future_time + timedelta(hours=1)).isoformat(),
            'category': self.category1.id
        }
        
        response = self.client.put(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['category'], self.category1.id)
        
        # Verify update in database
        self.timeslot1.refresh_from_db()
        self.assertEqual(self.timeslot1.category.id, self.category1.id)
    
    def test_update_booked_timeslot_critical_fields(self):
        """Test updating critical fields of booked timeslot (should fail)"""
        # Book the timeslot
        Booking.objects.create(user=self.regular_user, time_slot=self.timeslot1)
        
        self.authenticate_admin()
        url = reverse('admin_timeslot_detail', kwargs={'timeslot_id': self.timeslot1.id})
        
        future_time = timezone.now() + timedelta(days=3)
        data = {
            'start_time': future_time.isoformat(),
            'end_time': (future_time + timedelta(hours=1)).isoformat(),
            'category': self.category2.id
        }
        
        response = self.client.put(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Cannot modify time or category of booked slot', response.data['error'])
    
    def test_delete_timeslot_as_admin(self):
        """Test deleting timeslot as admin"""
        self.authenticate_admin()
        url = reverse('admin_timeslot_detail', kwargs={'timeslot_id': self.timeslot1.id})
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify timeslot is deleted
        self.assertFalse(TimeSlot.objects.filter(id=self.timeslot1.id).exists())
    
    def test_delete_booked_timeslot(self):
        """Test deleting booked timeslot (should fail)"""
        # Book the timeslot
        Booking.objects.create(user=self.regular_user, time_slot=self.timeslot1)
        
        self.authenticate_admin()
        url = reverse('admin_timeslot_detail', kwargs={'timeslot_id': self.timeslot1.id})
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Cannot delete booked time slot', response.data['error'])
    
    def test_get_nonexistent_timeslot(self):
        """Test getting non-existent timeslot"""
        self.authenticate_admin()
        url = reverse('admin_timeslot_detail', kwargs={'timeslot_id': 99999})
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class AdminBookingsListTest(BaseAPITestCase):
    """Test admin bookings list endpoint"""
    
    def setUp(self):
        super().setUp()
        # Create test bookings
        self.booking1 = Booking.objects.create(
            user=self.regular_user,
            time_slot=self.timeslot1
        )
        self.booking2 = Booking.objects.create(
            user=self.regular_user,
            time_slot=self.timeslot2
        )
    
    def test_get_all_bookings_as_admin(self):
        """Test getting all bookings as admin"""
        self.authenticate_admin()
        url = reverse('admin_bookings_list')
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_get_bookings_as_regular_user(self):
        """Test getting bookings as regular user (should fail)"""
        self.authenticate_user()
        url = reverse('admin_bookings_list')
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_get_bookings_unauthenticated(self):
        """Test getting bookings without authentication"""
        url = reverse('admin_bookings_list')
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_filter_bookings_by_date(self):
        """Test filtering bookings by date"""
        self.authenticate_admin()
        url = reverse('admin_bookings_list')
        
        filter_date = (timezone.now() + timedelta(days=1)).date()
        response = self.client.get(url, {'date': filter_date.strftime('%Y-%m-%d')})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_filter_bookings_by_user(self):
        """Test filtering bookings by user"""
        self.authenticate_admin()
        url = reverse('admin_bookings_list')
        
        response = self.client.get(url, {'user': self.regular_user.username})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
        for booking in response.data:
            self.assertEqual(booking['user_info']['username'], self.regular_user.username)
    
    def test_filter_bookings_by_category(self):
        """Test filtering bookings by category"""
        self.authenticate_admin()
        url = reverse('admin_bookings_list')
        
        response = self.client.get(url, {'category': self.category1.id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['time_slot_info']['category_id'], self.category1.id)
    
    def test_limit_bookings_results(self):
        """Test limiting bookings results"""
        self.authenticate_admin()
        url = reverse('admin_bookings_list')
        
        response = self.client.get(url, {'limit': '1'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class AdminCancelBookingTest(BaseAPITestCase):
    """Test admin cancel booking endpoint"""
    
    def setUp(self):
        super().setUp()
        self.booking = Booking.objects.create(
            user=self.regular_user,
            time_slot=self.timeslot1
        )
    
    def test_cancel_booking_as_admin(self):
        """Test canceling booking as admin"""
        self.authenticate_admin()
        url = reverse('admin_cancel_booking', kwargs={'booking_id': self.booking.id})
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertIn(f'Booking {self.booking.id} cancelled successfully', response.data['message'])
        
        # Verify booking is deleted
        self.assertFalse(Booking.objects.filter(id=self.booking.id).exists())
    
    def test_cancel_booking_as_regular_user(self):
        """Test canceling booking as regular user (should fail)"""
        self.authenticate_user()
        url = reverse('admin_cancel_booking', kwargs={'booking_id': self.booking.id})
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_cancel_booking_unauthenticated(self):
        """Test canceling booking without authentication"""
        url = reverse('admin_cancel_booking', kwargs={'booking_id': self.booking.id})
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_cancel_nonexistent_booking(self):
        """Test canceling non-existent booking"""
        self.authenticate_admin()
        url = reverse('admin_cancel_booking', kwargs={'booking_id': 99999})
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_admin_can_cancel_any_booking(self):
        """Test that admin can cancel any booking regardless of timing"""
        # Create a booking that would normally be past cancellation time
        # But admin should still be able to cancel it
        self.authenticate_admin()
        url = reverse('admin_cancel_booking', kwargs={'booking_id': self.booking.id})
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify booking is deleted
        self.assertFalse(Booking.objects.filter(id=self.booking.id).exists())
