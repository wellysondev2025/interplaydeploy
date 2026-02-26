from rest_framework import serializers
from core.models import Description

# ------------------- Descriptions -------------------
class DescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Description
        fields = ['id', 'activity', 'description']