from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver


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
        from django.utils import timezone
        
        # Check if time slot is already booked
        if self.time_slot_id and Booking.objects.filter(
            time_slot=self.time_slot
        ).exclude(pk=self.pk).exists():
            raise ValidationError("This time slot is already booked")
        
        # Check if time slot is in the past
        if self.time_slot and self.time_slot.start_time < timezone.now():
            raise ValidationError("Cannot book time slots in the past")
    
    @classmethod
    def can_book_slot(cls, user, time_slot):
        """Check if user can book this time slot"""
        from django.utils import timezone
        
        # Check if slot is in the past
        if time_slot.start_time < timezone.now():
            return False, "Time slot is in the past"
        
        # Check if slot is already booked
        if hasattr(time_slot, 'booking'):
            return False, "Time slot is already booked"
        
        # Check if user already has a booking at this time
        user_bookings = cls.objects.filter(
            user=user,
            time_slot__start_time__lt=time_slot.end_time,
            time_slot__end_time__gt=time_slot.start_time
        )
        if user_bookings.exists():
            return False, "You already have a booking at this time"
        
        return True, "Can book"
    
    def can_cancel(self):
        """Check if this booking can be cancelled"""
        from django.utils import timezone
        
        # Check if time slot is in the past
        if self.time_slot.start_time < timezone.now():
            return False, "Cannot cancel past bookings"
        
        return True, "Can cancel"
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user.username} - {self.time_slot}"


@receiver(post_save, sender=Booking)
def log_booking_created(sender, instance, created, **kwargs):
    """Log when a booking is created"""
    import logging
    logger = logging.getLogger(__name__)
    
    if created:
        logger.info(f"Booking created: {instance.user.username} booked {instance.time_slot}")


@receiver(post_delete, sender=Booking)
def log_booking_cancelled(sender, instance, **kwargs):
    """Log when a booking is cancelled"""
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"Booking cancelled: {instance.user.username} cancelled {instance.time_slot}")
