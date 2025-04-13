from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
import logging

from .models import User, UserPreference, VerificationToken

logger = logging.getLogger(__name__)

@receiver(post_save, sender=User)
def create_user_preference(sender, instance, created, **kwargs):
    """Create user preferences when a user is created."""
    if created:
        try:
            UserPreference.objects.get_or_create(user=instance)
            logger.info(f"Created preferences for user {instance.email}")
        except Exception as e:
            logger.error(f"Error creating preferences for user {instance.email}: {str(e)}")

@receiver(post_save, sender=User)
def send_verification_email(sender, instance, created, **kwargs):
    """Send verification email when a user is created."""
    if created:
        try:
            # Create verification token if not exists
            if not VerificationToken.objects.filter(user=instance, is_used=False).exists():
                token = VerificationToken.objects.create(
                    user=instance,
                    token=f"{instance.pk}-{timezone.now().timestamp()}",
                    expires_at=timezone.now() + timedelta(days=7)
                )
                
                # In a real application, send the verification email here
                logger.info(f"Created verification token for user {instance.email}: {token.token}")
        except Exception as e:
            logger.error(f"Error creating verification token for user {instance.email}: {str(e)}")

@receiver(post_delete, sender=User)
def clean_up_user_data(sender, instance, **kwargs):
    """Clean up related data when a user is deleted."""
    # Django should handle this with cascade deletes, but additional cleanup can be added here
    logger.info(f"User {instance.email} was deleted")