# core/views/painel/professionals.py
from rest_framework import generics
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from core.permissions import IsOwnerProfessionalOrSuperUser, IsProfessionalCreateAllowed, IsProfessionalAccessAllowed,IsOrganizationAdminOrSuperUser

from core.models import Professional
from core.serializers.painel.professionals import ProfessionalSerializer,ProfessionalCreateSerializer


@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(csrf_exempt, name='dispatch')
class ProfessionalListCreateView(generics.ListCreateAPIView):

    queryset = Professional.objects.all()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProfessionalCreateSerializer
        return ProfessionalSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role == user.Role.SUPERUSER:
            return Professional.objects.all()

        if user.role == user.Role.ORG_ADMIN:
            return Professional.objects.filter(
                user__organization=user.organization
            )

        return Professional.objects.filter(user=user)

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsProfessionalCreateAllowed()]
        return [IsProfessionalAccessAllowed()]

    def perform_create(self, serializer):
        user = self.request.user

        if user.role == user.Role.SUPERUSER:
            serializer.save()
        else:
            serializer.save()


@method_decorator(csrf_exempt, name='dispatch')
class ProfessionalRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET:
        - Superuser vê qualquer profissional.
        - Organization Admin vê profissionais da própria organização.
        - Profissional isolado vê apenas o próprio perfil.

    PUT/PATCH/DELETE:
        - Superuser pode alterar qualquer profissional.
        - Organization Admin pode alterar profissionais da própria organização.
        - Profissional isolado não pode alterar.
    """
    serializer_class = ProfessionalSerializer
    queryset = Professional.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Professional.objects.all()
        elif user.role == user.Role.ORG_ADMIN:
            return Professional.objects.filter(organization=user.organization)
        elif hasattr(user, "professional_profile"):
            return Professional.objects.filter(user=user)
        return Professional.objects.none()

    def get_permissions(self):
        """
        Para GET: permite superuser ou owner.
        Para PUT/PATCH/DELETE: permite superuser ou org admin.
        """
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsOrganizationAdminOrSuperUser()]
        return [IsOwnerProfessionalOrSuperUser()]