from rest_framework import serializers
from core.models import Patient

# ------------------- Patients -------------------
class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['id', 'name', 'date_nasc', 'hash_patient', 'professional']