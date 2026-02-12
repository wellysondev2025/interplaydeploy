from rest_framework import generics
from core.models import Professional
from core.serializers import ProfessionalSerializer, ProfessionalCreateSerializer
from core.permissions import (
    IsSuperUser,
    IsOwnerProfessionalOrSuperUser
)
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


@method_decorator(csrf_exempt, name='dispatch')  # ⚡ Ignora CSRF temporariamente para Postman
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

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)  # ⚡ Vai levantar ValidationError se algo estiver errado
            prof = serializer.save()
            return Response(
                {"success": True, "professional": ProfessionalSerializer(prof).data},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            # 🔥 Retorna erros detalhados sem quebrar a view
            return Response(
                {"success": False, "errors": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


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
