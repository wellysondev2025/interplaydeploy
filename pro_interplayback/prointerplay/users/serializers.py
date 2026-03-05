from rest_framework import serializers
from django.contrib.auth import get_user_model
from organizations.models import Organization

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.none(),
        required=False
    )

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "name",
            "password",
            "role",
            "organization",
        ]
        read_only_fields = ["role"]

    def get_fields(self):
        """
        Ajusta dinamicamente os campos dependendo do usuário logado.
        """
        fields = super().get_fields()
        request = self.context.get("request")

        if not request:
            return fields

        # SUPERUSER pode escolher role e organization
        if request.user.is_superuser:
            fields["role"].read_only = False
            fields["organization"].queryset = Organization.objects.all()
        else:
            # ORG_ADMIN não escolhe role nem organization
            fields.pop("organization")
            fields["role"].read_only = True

        return fields

    def create(self, validated_data):
        request = self.context.get("request")
        password = validated_data.pop("password")

        if request.user.role == User.Role.SUPERUSER:
            # Superuser pode escolher role e organization
            role = validated_data.get("role", User.Role.PROFESSIONAL)
            organization = validated_data.get("organization")

            if role != User.Role.PROFESSIONAL and not organization:
                raise serializers.ValidationError(
                    "Superuser deve definir organization para roles administrativas."
                )

        else:
            # Org Admin só cria Professional
            role = User.Role.PROFESSIONAL
            validated_data["organization"] = request.user.organization

        validated_data["role"] = role

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        return user