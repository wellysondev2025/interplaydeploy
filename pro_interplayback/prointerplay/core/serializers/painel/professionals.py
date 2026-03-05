from rest_framework import serializers
from core.models import Professional
from users.models import User
from organizations.models import Organization


class ProfessionalPainelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Professional
        fields = ["name", "code", "cpf", "address"]  # dados úteis do profissional


class ProfessionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Professional
        fields = "__all__"



class ProfessionalCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, required=False)
    role = serializers.ChoiceField(
        choices=User.Role.choices,
        required=False
    )
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.all(),
        required=False
    )

    class Meta:
        model = Professional
        fields = [
            "email",
            "password",
            "role",
            "organization",
            "code",
            "cpf",
            "name",
            "address",
        ]

    def validate(self, attrs):
        # obrigatoriedade de code e cpf
        if not attrs.get("code"):
            raise serializers.ValidationError({"code": "O código é obrigatório."})
        if not attrs.get("cpf"):
            raise serializers.ValidationError({"cpf": "O CPF é obrigatório."})
        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        creator = request.user

        email = validated_data.pop("email")
        password = validated_data.pop("password", None)

        # SUPERUSER pode definir role e org
        if creator.role == User.Role.SUPERUSER:
            role = validated_data.pop("role", User.Role.PROFESSIONAL)
            organization = validated_data.pop("organization", None)
        else:
            role = User.Role.PROFESSIONAL
            organization = creator.organization

        user = User.objects.create_user(
            email=email,
            password=password or User.objects.make_random_password(),
            name=validated_data["name"],
            role=role,
            organization=organization,
            is_staff=False,
            is_superuser=False,
        )

        professional = Professional.objects.create(
            user=user,
            **validated_data
        )

        return professional

    def update(self, instance, validated_data):
        request = self.context["request"]
        editor = request.user
        user = instance.user

        # Campos que SUPERUSER pode alterar
        if editor.role == User.Role.SUPERUSER:
            user.email = validated_data.get("email", user.email)
            password = validated_data.get("password")
            if password:
                user.set_password(password)
            user.role = validated_data.get("role", user.role)
            user.organization = validated_data.get("organization", user.organization)
            user.save()

        # Todos podem alterar dados do profissional
        instance.code = validated_data.get("code", instance.code)
        instance.cpf = validated_data.get("cpf", instance.cpf)
        instance.name = validated_data.get("name", instance.name)
        instance.address = validated_data.get("address", instance.address)
        instance.save()

        return instance