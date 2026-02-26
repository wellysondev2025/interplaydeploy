from rest_framework import serializers
from core.models import Session

# ------------------- Sessions -------------------
class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ['id', 'patient', 'session_hash', 'start_date', 'end_date',
                  'time_session', 'finally_session', 'session_type', 'version_app']