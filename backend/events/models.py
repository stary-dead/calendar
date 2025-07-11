from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class EventCategory(models.TextChoices):
    """Fixed event categories as specified in requirements"""
    CAT_1 = 'cat_1', 'Cat 1'
    CAT_2 = 'cat_2', 'Cat 2'
    CAT_3 = 'cat_3', 'Cat 3'


class Event(models.Model):
    """Event model for calendar slots"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(
        max_length=10,
        choices=EventCategory.choices,
        default=EventCategory.CAT_1
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    max_participants = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(100)]
    )
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='created_events'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['start_time']
        indexes = [
            models.Index(fields=['start_time', 'end_time']),
            models.Index(fields=['category']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.title} ({self.category}) - {self.start_time.strftime('%Y-%m-%d %H:%M')}"

    @property
    def available_slots(self):
        """Return number of available booking slots"""
        from bookings.models import Booking
        booked_count = Booking.objects.filter(
            event=self, 
            status='confirmed'
        ).count()
        return max(0, self.max_participants - booked_count)

    @property
    def is_fully_booked(self):
        """Check if event is fully booked"""
        return self.available_slots == 0

    def clean(self):
        """Validate event data"""
        from django.core.exceptions import ValidationError
        
        if self.start_time and self.end_time:
            if self.start_time >= self.end_time:
                raise ValidationError("End time must be after start time")
            
            # Check for overlapping events (same time slot, same category)
            overlapping = Event.objects.filter(
                category=self.category,
                start_time__lt=self.end_time,
                end_time__gt=self.start_time,
                is_active=True
            ).exclude(pk=self.pk)
            
            if overlapping.exists():
                raise ValidationError(
                    f"An event with category {self.get_category_display()} "
                    "already exists in this time slot"
                )
