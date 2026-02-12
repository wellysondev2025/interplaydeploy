from rest_framework import generics
from core.models import Professional
from core.serializers import ProfessionalSerializer, ProfessionalCreateSerializer
from core.permissions import (
    IsSuperUser,
    IsOwnerProfessionalOrSuperUser
)


class ProfessionalListCreateView(generics.ListCreateAPIView):
    """
    Apenas SuperUser pode listar ou criar profissionais.
    """
    queryset = Professional.objects.all()
    serializer_class = ProfessionalSerializer
    permission_classes = [IsSuperUser]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProfessionalCreateSerializer
        return ProfessionalSerializer


class ProfessionalRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET:
        - SuperUser pode ver qualquer profissional.
        - Professional pode ver apenas o próprio perfil.

    PUT/PATCH/DELETE:
        - Apenas SuperUser pode alterar ou deletar.
    """
    queryset = Professional.objects.all()
    serializer_class = ProfessionalSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsOwnerProfessionalOrSuperUser()]
        return [IsSuperUser()]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return Professional.objects.all()

        if hasattr(user, "professional_profile"):
            return Professional.objects.filter(user=user)

        return Professional.objects.none()

    def put(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
