from rest_framework import serializers
from core.models import Professional
from users.models import User

class ProfessionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Professional
        fields = "__all__"