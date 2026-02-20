from django.db import models
import uuid


class Organization(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=20, unique=True, default=uuid.uuid4)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name