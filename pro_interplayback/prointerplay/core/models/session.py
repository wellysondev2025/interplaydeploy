import uuid
from django.db import models
from .patient import Patient
from cloudinary.models import CloudinaryField

# ---------------------------
# Sessão
# ---------------------------
class Session(models.Model):
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="sessions"
    )

    session_hash = models.CharField(max_length=36, unique=True, editable=False)

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
