# core/models.py
import uuid
from django.db import models
from users.models import User


# ---------------------------
# Profissional
# ---------------------------

class Professional(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="professional_profile"
    )

    code = models.CharField(max_length=20, unique=True)
    cpf = models.CharField(max_length=11, unique=True, null=True, blank=True)

    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255,  null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.code})"
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


# ---------------------------
# Sessão
# ---------------------------
class Session(models.Model):
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="sessions"
    )

    session_hash = models.CharField(max_length=100, unique=True, blank=True)

    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)

    time_session = models.IntegerField(null=True, blank=True)
    finally_session = models.BooleanField(default=False)

    session_type = models.CharField(max_length=50, blank=True)
    version_app = models.CharField(max_length=50, blank=True)

    def save(self, *args, **kwargs):
        if not self.session_hash:
            self.session_hash = str(uuid.uuid4())
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Session {self.id} - Patient {self.patient.name}"


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
    path_relative_image = models.CharField(max_length=255, blank=True, null=True)  # <--- adicionado

    hash = models.CharField(max_length=100, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.hash:
            self.hash = str(uuid.uuid4())
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Activity {self.cod_activity}"


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


# ---------------------------
# HashModel
# ---------------------------
class HashModel(models.Model):
    hash = models.CharField(max_length=100, unique=True)
    request_date = models.DateTimeField(auto_now_add=True)
    device = models.CharField(max_length=100)

    def __str__(self):
        return self.hash
