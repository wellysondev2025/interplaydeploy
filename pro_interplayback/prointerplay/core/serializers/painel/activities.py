from rest_framework import serializers
from core.models import Activity

class ActivityPainelSerializer(serializers.ModelSerializer):
    description = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = [
            "id",
            "cod_activity",
            "duration",
            "image_url",
            "hash",
            "description",
        ]

    def get_description(self, obj):
        if hasattr(obj, "description") and obj.description:
            return {"text": obj.description.description}
        return {"text": ""}

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None