from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    """Extended user profile"""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    phone_number = models.CharField(max_length=20, blank=True)
    timezone = models.CharField(max_length=50, default='UTC')
    notification_preferences = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

    @property
    def full_name(self):
        """Get user's full name"""
        return f"{self.user.first_name} {self.user.last_name}".strip()

    @property
    def display_name(self):
        """Get display name (full name or username)"""
        return self.full_name if self.full_name else self.user.username


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create user profile when user is created"""
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save user profile when user is saved"""
    if hasattr(instance, 'profile'):
        instance.profile.save()


class UserPreference(models.Model):
    """User preferences for event categories"""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='preferences'
    )
    # Category preferences (Cat 1, Cat 2, Cat 3)
    cat1_enabled = models.BooleanField(default=True)
    cat2_enabled = models.BooleanField(default=True)
    cat3_enabled = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        enabled_cats = []
        if self.cat1_enabled:
            enabled_cats.append('Cat 1')
        if self.cat2_enabled:
            enabled_cats.append('Cat 2')
        if self.cat3_enabled:
            enabled_cats.append('Cat 3')
        return f"{self.user.username}: {', '.join(enabled_cats)}"

    @property
    def enabled_categories(self):
        """Get list of enabled category codes"""
        categories = []
        if self.cat1_enabled:
            categories.append('cat1')
        if self.cat2_enabled:
            categories.append('cat2')
        if self.cat3_enabled:
            categories.append('cat3')
        return categories


@receiver(post_save, sender=User)
def create_user_preferences(sender, instance, created, **kwargs):
    """Create user preferences when user is created"""
    if created:
        UserPreference.objects.create(user=instance)
