from rest_framework import serializers
from django.contrib.auth.models import User
from events.models import Category, TimeSlot
from bookings.models import Booking


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    
    class Meta:
        model = Category
        fields = ['id', 'name']


class TimeSlotSerializer(serializers.ModelSerializer):
    """Serializer for TimeSlot model with booking info"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_booked = serializers.SerializerMethodField()
    booked_by = serializers.SerializerMethodField()
    can_book = serializers.SerializerMethodField()
    
    class Meta:
        model = TimeSlot
        fields = [
            'id', 'category', 'category_name', 'start_time', 'end_time',
            'is_booked', 'booked_by', 'can_book', 'created_by', 'created_at'
        ]
        read_only_fields = ['created_by', 'created_at']
    
    def get_is_booked(self, obj):
        """Check if time slot is booked"""
        return hasattr(obj, 'booking')
    
    def get_booked_by(self, obj):
        """Get username of user who booked this slot"""
        if hasattr(obj, 'booking'):
            return obj.booking.user.username
        return None
    
    def get_can_book(self, obj):
        """Check if current user can book this slot"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        can_book, _ = Booking.can_book_slot(request.user, obj)
        return can_book


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bookings"""
    
    class Meta:
        model = Booking
        fields = ['time_slot']
    
    def validate_time_slot(self, value):
        """Validate time slot can be booked"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required")
        
        can_book, message = Booking.can_book_slot(request.user, value)
        if not can_book:
            raise serializers.ValidationError(message)
        
        return value
    
    def create(self, validated_data):
        """Create booking with current user"""
        request = self.context.get('request')
        validated_data['user'] = request.user
        return super().create(validated_data)


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for booking details"""
    time_slot = TimeSlotSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    can_cancel = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'time_slot', 'username', 'booked_at', 'can_cancel'
        ]
        read_only_fields = ['booked_at']
    
    def get_can_cancel(self, obj):
        """Check if booking can be cancelled"""
        can_cancel, _ = obj.can_cancel()
        return can_cancel


class UserBookingSerializer(serializers.ModelSerializer):
    """Simplified serializer for user's own bookings"""
    time_slot = TimeSlotSerializer(read_only=True)
    can_cancel = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = ['id', 'time_slot', 'booked_at', 'can_cancel']
        read_only_fields = ['booked_at']
    
    def get_can_cancel(self, obj):
        """Check if booking can be cancelled"""
        can_cancel, _ = obj.can_cancel()
        return can_cancel


# Admin API Serializers

class AdminTimeSlotCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating time slots (admin only)"""
    
    class Meta:
        model = TimeSlot
        fields = ['category', 'start_time', 'end_time']
    
    def validate(self, data):
        """Validate time slot data"""
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        if start_time and end_time:
            if start_time >= end_time:
                raise serializers.ValidationError(
                    "Start time must be before end time"
                )
            
            # Check for overlapping slots (excluding current instance during update)
            queryset = TimeSlot.objects.filter(
                start_time__lt=end_time,
                end_time__gt=start_time
            )
            
            if self.instance:
                queryset = queryset.exclude(id=self.instance.id)
            
            if queryset.exists():
                raise serializers.ValidationError(
                    "Time slot overlaps with existing slot"
                )
        
        return data


class AdminTimeSlotSerializer(serializers.ModelSerializer):
    """Detailed serializer for time slots with booking info (admin view)"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    booking_info = serializers.SerializerMethodField()
    is_booked = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = TimeSlot
        fields = [
            'id', 'category', 'category_name', 'start_time', 'end_time',
            'is_booked', 'booking_info', 'created_by', 'created_by_username', 'created_at'
        ]
        read_only_fields = ['created_by', 'created_at']
    
    def get_is_booked(self, obj):
        """Check if time slot is booked"""
        return hasattr(obj, 'booking')
    
    def get_booking_info(self, obj):
        """Get detailed booking information if slot is booked"""
        if hasattr(obj, 'booking'):
            booking = obj.booking
            return {
                'booking_id': booking.id,
                'user_id': booking.user.id,
                'username': booking.user.username,
                'user_email': booking.user.email,
                'booked_at': booking.booked_at,
                'can_cancel': booking.can_cancel()[0]
            }
        return None


class AdminBookingSerializer(serializers.ModelSerializer):
    """Detailed serializer for bookings (admin view)"""
    user_info = serializers.SerializerMethodField()
    time_slot_info = serializers.SerializerMethodField()
    can_cancel = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'user_info', 'time_slot_info', 'booked_at', 'can_cancel'
        ]
        read_only_fields = ['booked_at']
    
    def get_user_info(self, obj):
        """Get user information"""
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
            'is_staff': obj.user.is_staff
        }
    
    def get_time_slot_info(self, obj):
        """Get time slot information"""
        return {
            'id': obj.time_slot.id,
            'category_id': obj.time_slot.category.id,
            'category_name': obj.time_slot.category.name,
            'start_time': obj.time_slot.start_time,
            'end_time': obj.time_slot.end_time
        }
    
    def get_can_cancel(self, obj):
        """Check if booking can be cancelled"""
        can_cancel, _ = obj.can_cancel()
        return can_cancel
