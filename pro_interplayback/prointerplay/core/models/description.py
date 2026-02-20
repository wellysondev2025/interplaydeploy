import uuid
from django.db import models
from users.models import User
from cloudinary.models import CloudinaryField
from .activity import Activity


# ---------------------------
# Description
# ---------------------------
class Description(models.Model):
    activity = models.OneToOneField(
        Activity,
        on_delete=models.CASCADE,
        related_name="description"
    )

    description = models.TextField(blank=True)

    def __str__(self):
        return f"Description for {self.activity.cod_activity}"