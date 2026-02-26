from rest_framework import serializers
from core.models import Session
from .activities import ActivityPainelSerializer

class SessionPainelSerializer(serializers.ModelSerializer):
    activities = ActivityPainelSerializer(many=True, read_only=True)

    class Meta:
        model = Session
        fields = [
            "id",
            "session_hash",
            "start_date",
            "end_date",
            "time_session",
            "finally_session",
            "session_type", 
            "version_app",
            "activities",
        ]
