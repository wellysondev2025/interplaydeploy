# core/serializers.py
from rest_framework import serializers
from .models import Patient, Session, Activity, Description, Professional
from users.models import User


# ------------------- Patients -------------------
class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['id', 'name', 'date_nasc', 'hash_patient', 'professional']


# ------------------- Sessions -------------------
class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ['id', 'patient', 'session_hash', 'start_date', 'end_date',
                  'time_session', 'finally_session', 'session_type', 'version_app']


# ------------------- Activities -------------------
class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'session', 'cod_activity', 'end_date_activity',
                  'path_relative_image', 'duration', 'hash']


# ------------------- Descriptions -------------------
class DescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Description
        fields = ['id', 'activity', 'description']


# ------------------- Professionals -------------------
class ProfessionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Professional
        fields = "__all__"


class ProfessionalCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Professional
        fields = ["email", "password", "code", "cpf", "name", "address"]

    def validate(self, attrs):
        if self.instance is None:  # criação
            if not attrs.get("code"):
                raise serializers.ValidationError({"code": "O código é obrigatório."})
            if not attrs.get("cpf"):
                raise serializers.ValidationError({"cpf": "O CPF é obrigatório."})
        return attrs

    def create(self, validated_data):
        email = validated_data.pop("email")
        password = validated_data.pop("password")

        # cria o user
        user = User.objects.create_user(
            email=email,
            password=password,
            name=validated_data["name"],
            admin=False,
            super_user=False
        )

        # cria o professional
        professional = Professional.objects.create(
            user=user,
            **validated_data
        )

        return professional


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
            "session_hash",
            "start_date",
            "end_date",
            "time_session",
            "finally_session",
            "session_type", 
            "version_app",
            "activities",
        ]



class ProfessionalPainelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Professional
        fields = ["name", "code", "cpf", "address"]  # dados úteis do profissional

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
