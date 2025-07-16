from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class Category(models.Model):
    """Fixed event categories as specified in requirements"""
    CAT_1 = 'Cat 1'
    CAT_2 = 'Cat 2'
    CAT_3 = 'Cat 3'
    
    CATEGORY_CHOICES = [
        (CAT_1, 'Cat 1'),
        (CAT_2, 'Cat 2'),
        (CAT_3, 'Cat 3'),
    ]
    
    name = models.CharField(
        max_length=10,
        choices=CATEGORY_CHOICES,
        unique=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class TimeSlot(models.Model):
    """Time slots for event booking"""
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='time_slots'
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_time_slots'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['start_time']
        indexes = [
            models.Index(fields=['start_time', 'end_time']),
            models.Index(fields=['category']),
        ]
    
    def clean(self):
        """Validate time slot data"""
        from django.utils import timezone
        
        if self.start_time and self.end_time:
            # Check time order
            if self.start_time >= self.end_time:
                raise ValidationError("Start time must be before end time")
            
            # Check if slot is not in the past (only for new slots)
            if not self.pk and self.start_time < timezone.now():
                raise ValidationError("Cannot create time slots in the past")
            
            # Check for overlapping slots in the same category
            overlapping = TimeSlot.objects.filter(
                category=self.category,
                start_time__lt=self.end_time,
                end_time__gt=self.start_time
            ).exclude(pk=self.pk)
            
            if overlapping.exists():
                raise ValidationError("Time slot overlaps with existing slot in the same category")
            
            # Check minimum duration (15 minutes)
            duration = self.end_time - self.start_time
            if duration.total_seconds() < 900:  # 15 minutes
                raise ValidationError("Time slot must be at least 15 minutes long")
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    @property
    def is_available(self):
        """Check if time slot is available for booking"""
        from django.utils import timezone
        if not self.start_time or not self.end_time:
            return False
        # Check if in the past
        if self.start_time < timezone.now():
            return False
        
        # Check if already booked
        return not hasattr(self, 'booking')
    
    def is_available_for_user(self, user):
        """Check if time slot is available for specific user"""
        from django.utils import timezone
        
        # Check if in the past
        if self.start_time < timezone.now():
            return False, "Time slot is in the past"
        
        # Check if already booked
        if hasattr(self, 'booking'):
            if self.booking.user == user:
                return False, "You have already booked this slot"
            else:
                return False, "This slot is already booked by another user"
        
        # Check if user has conflicting bookings
        from bookings.models import Booking
        conflicts = Booking.objects.filter(
            user=user,
            time_slot__start_time__lt=self.end_time,
            time_slot__end_time__gt=self.start_time
        )
        if conflicts.exists():
            return False, "You have a conflicting booking at this time"
        
        return True, "Available"
    
    def get_booking_user(self):
        """Get the user who booked this slot, if any"""
        if hasattr(self, 'booking'):
            return self.booking.user
        return None
    
    @property
    def duration_minutes(self):
        """Return duration in minutes"""
        return int((self.end_time - self.start_time).total_seconds() / 60) if self.start_time and self.end_time else 0
    
    def __str__(self):
        return f"{self.category.name} - {self.start_time.strftime('%Y-%m-%d %H:%M')} to {self.end_time.strftime('%H:%M')}"
