from rest_framework import serializers
from core.models import Professional
from users.models import User


class ProfessionalPainelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Professional
        fields = ["name", "code", "cpf", "address"]  # dados úteis do profissional


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
        request = self.context["request"]
        creator = request.user

        email = validated_data.pop("email")
        password = validated_data.pop("password")

        # Define organização automaticamente
        if creator.role == creator.Role.SUPERUSER:
            organization = creator.organization
        else:
            organization = creator.organization

        # Cria o User corretamente
        user = User.objects.create_user(
            email=email,
            password=password,
            name=validated_data["name"],
            role=User.Role.PROFESSIONAL,
            organization=organization,
            is_staff=False,
            is_superuser=False
        )

        professional = Professional.objects.create(
            user=user,
            **validated_data
        )

        return professional