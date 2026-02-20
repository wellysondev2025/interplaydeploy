
from django.db import models
from users.models import User


# ---------------------------
# Profissional
# ---------------------------

from django.core.exceptions import ValidationError

class Professional(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="professional_profile"
    )

    code = models.CharField(max_length=20, unique=True)
    cpf = models.CharField(max_length=11, unique=True, null=True, blank=True)

    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255, null=True, blank=True)


    def __str__(self):
        return f"{self.name} ({self.code})"
