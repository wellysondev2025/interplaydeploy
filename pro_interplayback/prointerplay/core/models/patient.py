import uuid
from django.db import models
from users.models import User
from cloudinary.models import CloudinaryField
from .professional import Professional

# ---------------------------
# Paciente
# ---------------------------
class Patient(models.Model):
    name = models.CharField(max_length=255)
    date_nasc = models.DateField(null=True, blank=True)

    professional = models.ForeignKey(
        Professional,
        on_delete=models.PROTECT,
        related_name="patients"
    )

    hash_patient = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    def save(self, *args, **kwargs):
        if not self.hash_patient:
            self.hash_patient = str(uuid.uuid4())
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
