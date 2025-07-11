from django.db import models
from django.contrib.auth.models import User
from events.models import Event


class BookingStatus(models.TextChoices):
    """Booking status choices"""
    PENDING = 'pending', 'Pending'
    CONFIRMED = 'confirmed', 'Confirmed'
    CANCELLED = 'cancelled', 'Cancelled'


class Booking(models.Model):
    """Booking model for event reservations"""
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    status = models.CharField(
        max_length=10,
        choices=BookingStatus.choices,
        default=BookingStatus.CONFIRMED
    )
    booked_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-booked_at']
        unique_together = ['event', 'user']  # Prevent duplicate bookings
        indexes = [
            models.Index(fields=['event', 'status']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['booked_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.event.title} ({self.status})"

    def clean(self):
        """Validate booking data"""
        from django.core.exceptions import ValidationError
        
        # Check if event is active
        if not self.event.is_active:
            raise ValidationError("Cannot book an inactive event")
        
        # Check if event is already fully booked
        if self.event.is_fully_booked and not self.pk:  # New booking
            raise ValidationError("Event is fully booked")
        
        # Check if user already has a booking for this event
        if not self.pk:  # New booking
            existing_booking = Booking.objects.filter(
                event=self.event,
                user=self.user,
                status__in=['pending', 'confirmed']
            ).exists()
            
            if existing_booking:
                raise ValidationError("User already has a booking for this event")

    def save(self, *args, **kwargs):
        """Custom save to handle validation"""
        self.full_clean()
        super().save(*args, **kwargs)
