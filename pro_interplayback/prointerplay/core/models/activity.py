# core/models.py
import uuid
from django.db import models
from cloudinary.models import CloudinaryField
from .session import Session

# ---------------------------
# Activity
# ---------------------------
class Activity(models.Model):
    session = models.ForeignKey(
        Session,
        on_delete=models.CASCADE,
        related_name="activities"
    )

    cod_activity = models.CharField(max_length=50)
    end_date_activity = models.DateTimeField(null=True, blank=True)
    duration = models.IntegerField(null=True, blank=True)
    image = CloudinaryField('image', blank=True, null=True)

    hash = models.CharField(max_length=100, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.hash:
            self.hash = str(uuid.uuid4())
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Activity {self.cod_activity}"
