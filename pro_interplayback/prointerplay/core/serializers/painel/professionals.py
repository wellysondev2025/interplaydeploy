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
        email = validated_data.pop("email")
        password = validated_data.pop("password")

        # cria o user
        user = User.objects.create_user(
            email=email,
            password=password,
            name=validated_data["name"],
            is_staff=False,      # garante que não é staff
            is_superuser=False   # garante que não é superuser
        )

        # cria o professional
        professional = Professional.objects.create(
            user=user,
            **validated_data
        )

        return professional