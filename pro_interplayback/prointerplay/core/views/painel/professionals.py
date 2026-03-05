from rest_framework import generics
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from core.permissions import (
    IsOwnerProfessionalOrSuperUser,
    IsProfessionalCreateAllowed,
    IsProfessionalAccessAllowed,
    IsOrganizationAdminOrSuperUser,
)

from core.models import Professional
from core.serializers.painel.professionals import (
    ProfessionalSerializer,
    ProfessionalCreateSerializer,
)


@method_decorator(csrf_exempt, name="dispatch")
class ProfessionalListCreateView(generics.ListCreateAPIView):
    serializer_class = ProfessionalSerializer  # apenas default, POST troca

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProfessionalCreateSerializer
        return ProfessionalSerializer

    def get_queryset(self):
        user = self.request.user

        qs = Professional.objects.select_related("user", "user__organization")

        if user.role == user.Role.SUPERUSER:
            return qs
        if user.role == user.Role.ORG_ADMIN:
            return qs.filter(user__organization=user.organization)
        return qs.filter(user=user)

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsProfessionalCreateAllowed()]
        return [IsProfessionalAccessAllowed()]


@method_decorator(csrf_exempt, name="dispatch")
class ProfessionalRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProfessionalSerializer

    def get_queryset(self):
        user = self.request.user

        qs = Professional.objects.select_related("user", "user__organization")

        if user.role == user.Role.SUPERUSER:
            return qs
        if user.role == user.Role.ORG_ADMIN:
            return qs.filter(user__organization=user.organization)
        if hasattr(user, "professional_profile"):
            return qs.filter(user=user)
        return qs.none()

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsOrganizationAdminOrSuperUser()]
        return [IsOwnerProfessionalOrSuperUser()]