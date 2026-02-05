from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Activity, Description


@receiver(post_save, sender=Activity)
def create_description_for_activity(sender, instance, created, **kwargs):
    if created:
        Description.objects.create(
            activity=instance,
            description=""
        )
