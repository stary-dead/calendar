from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserPreference(models.Model):
    """User preferences for event categories"""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='preferences'
    )
    cat_1 = models.BooleanField(default=False, verbose_name="Cat 1")
    cat_2 = models.BooleanField(default=False, verbose_name="Cat 2")
    cat_3 = models.BooleanField(default=False, verbose_name="Cat 3")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "User Preference"
        verbose_name_plural = "User Preferences"
    
    def __str__(self):
        preferences = []
        if self.cat_1:
            preferences.append("Cat 1")
        if self.cat_2:
            preferences.append("Cat 2")
        if self.cat_3:
            preferences.append("Cat 3")
        return f"{self.user.username} - {', '.join(preferences) if preferences else 'No preferences'}"
    
    @property
    def selected_categories(self):
        """Return list of selected category names"""
        categories = []
        if self.cat_1:
            categories.append("Cat 1")
        if self.cat_2:
            categories.append("Cat 2")
        if self.cat_3:
            categories.append("Cat 3")
        return categories


@receiver(post_save, sender=User)
def create_user_preferences(sender, instance, created, **kwargs):
    """Automatically create user preferences when user is created"""
    if created:
        UserPreference.objects.create(user=instance)
