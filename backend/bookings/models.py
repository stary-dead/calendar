from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class Booking(models.Model):
    """Booking model for time slot reservations"""
    time_slot = models.OneToOneField(
        'events.TimeSlot',
        on_delete=models.CASCADE,
        related_name='booking'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    booked_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-booked_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['booked_at']),
        ]
    
    def clean(self):
        """Validate booking data"""
        # Check if time slot is already booked
        if self.time_slot_id and Booking.objects.filter(
            time_slot=self.time_slot
        ).exclude(pk=self.pk).exists():
            raise ValidationError("This time slot is already booked")
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user.username} - {self.time_slot}"
