# users/models.py

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.base_user import BaseUserManager
from django.core.exceptions import ValidationError
from organizations.models import Organization


class UserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("O email é obrigatório")

        email = self.normalize_email(email)

        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("role", User.Role.PROFESSIONAL)

        organization = extra_fields.get("organization")
        if not organization:
            raise ValueError("Usuário deve estar vinculado a uma Organization.")

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Superuser também pertence a uma Organization.
        Se nenhuma for informada, criamos automaticamente.
        """

        extra_fields.setdefault("role", User.Role.SUPERUSER)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        organization = extra_fields.get("organization")

        if not organization:
            organization, _ = Organization.objects.get_or_create(
                name="Master Organization",
                defaults={"is_solo": False}
            )

        extra_fields["organization"] = organization

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):

    class Role(models.TextChoices):
        SUPERUSER = "superuser", "Superuser"
        ORG_ADMIN = "org_admin", "Organization Admin"
        PROFESSIONAL = "professional", "Professional"

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, blank=True)

    role = models.CharField(
        max_length=30,
        choices=Role.choices,
        default=Role.PROFESSIONAL
    )

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="users"
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def clean(self):
        """
        Regras estruturais de integridade.
        """

        # Organization é obrigatória para todos
        if not self.organization:
            raise ValidationError(
                "Usuário deve estar vinculado a uma Organization."
            )

        # Organization Admin não pode existir em org solo
        if (
            self.role == self.Role.ORG_ADMIN
            and self.organization
            and self.organization.is_solo
        ):
            raise ValidationError(
                "Organization solo não pode ter Organization Admin."
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email