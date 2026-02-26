from rest_framework import serializers
from core.models import Patient
from .professionals import ProfessionalPainelSerializer
from .sessions import SessionPainelSerializer



class PatientPainelSerializer(serializers.ModelSerializer):
    sessions = SessionPainelSerializer(many=True, read_only=True)
    professional = ProfessionalPainelSerializer(read_only=True)  # inclui info do profissional

    class Meta:
        model = Patient
        fields = [
            "id",
            "name",
            "date_nasc",
            "hash_patient",
            "professional",
            "sessions",
        ]
