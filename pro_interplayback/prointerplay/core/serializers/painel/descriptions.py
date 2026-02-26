from rest_framework import serializers
from core.models import Description


class DescriptionPainelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Description
        fields = ["description"]
