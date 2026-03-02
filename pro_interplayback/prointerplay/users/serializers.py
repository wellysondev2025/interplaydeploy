from rest_framework import serializers
from django.contrib.auth import get_user_model
from organizations.serializers import OrganizationSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "name",
            "role",
            "is_staff",
            "is_superuser",
            "organization",
        ]

    def get_role(self, obj):
        if obj.is_superuser:
            return "superuser"
        if obj.organization_admin:
            return "org_admin"
        return "professional"