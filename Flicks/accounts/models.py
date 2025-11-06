"""
Cynara Accounts Models

Extended user functionality for authentication and user management.
"""

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserPreferences(models.Model):
    """Additional user preferences specific to Cynara"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    
    # Display preferences
    theme = models.CharField(
        max_length=20,
        choices=[
            ('dark', 'Dark Theme'),
            ('light', 'Light Theme'),
            ('auto', 'Auto (System)'),
        ],
        default='dark'
    )
    
    # Streaming preferences
    auto_play_next = models.BooleanField(default=True)
    default_quality = models.CharField(
        max_length=10,
        choices=[
            ('auto', 'Auto'),
            ('1080p', '1080p'),
            ('720p', '720p'),
            ('480p', '480p'),
        ],
        default='auto'
    )
    
    # Notification preferences
    email_notifications = models.BooleanField(default=True)
    new_movie_alerts = models.BooleanField(default=True)
    
    # Privacy
    public_profile = models.BooleanField(default=False)
    show_watch_history = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Preferences"


# Automatically create user preferences when user is created
@receiver(post_save, sender=User)
def create_user_preferences(sender, instance, created, **kwargs):
    if created:
        UserPreferences.objects.create(user=instance)
