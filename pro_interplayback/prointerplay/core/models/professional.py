from django.db import models
from users.models import User
from organizations.models import Organization
from django.core.exceptions import ValidationError

class Professional(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="professional_profile"
    )

    # ✅ NOVO CAMPO: vincula o profissional a uma clínica
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="professionals"
    )

    code = models.CharField(max_length=20, unique=True)
    cpf = models.CharField(max_length=11, unique=True, null=True, blank=True)

    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.code})"