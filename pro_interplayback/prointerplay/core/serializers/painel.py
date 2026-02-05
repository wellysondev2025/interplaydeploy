from rest_framework import serializers
from core.models import Patient, Session, Activity, Description


class DescriptionPainelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Description
        fields = ["description"]


class ActivityPainelSerializer(serializers.ModelSerializer):
    description = DescriptionPainelSerializer(read_only=True)

    class Meta:
        model = Activity
        fields = [
            "id",
            "cod_activity",
            "duration",
            "path_relative_image",
            "description",
        ]


class SessionPainelSerializer(serializers.ModelSerializer):
    activities = ActivityPainelSerializer(many=True, read_only=True)

    class Meta:
        model = Session
        fields = [
            "id",
            "session_type",
            "start_date",
            "end_date",
            "activities",
        ]


class PatientPainelSerializer(serializers.ModelSerializer):
    sessions = SessionPainelSerializer(many=True, read_only=True)

    class Meta:
        model = Patient
        fields = [
            "id",
            "name",
            "hash_patient",
            "sessions",
        ]
