from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from django.contrib.auth import get_user_model
from core.permissions import IsOrgAdminCreationAllowed
from .serializers import UserSerializer

User = get_user_model()


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # SUPERUSER → vê todos
        if user.role == user.Role.SUPERUSER:
            return User.objects.all()

        # ORG_ADMIN → vê apenas usuários da própria organização
        if user.role == user.Role.ORG_ADMIN:
            return User.objects.filter(
                organization=user.organization
            )

        # PROFESSIONAL → vê apenas a si mesmo
        return User.objects.filter(id=user.id)

    def get_permissions(self):
        """
        Regras:
        - SUPERUSER pode tudo
        - ORG_ADMIN pode gerenciar usuários da própria organização
        - PROFESSIONAL só pode ver a si mesmo
        - Apenas SUPERUSER pode criar ORG_ADMIN
        """

        if self.request.method == "POST":
            role = self.request.data.get("role")

            # Se estiver tentando criar ORG_ADMIN
            if role == User.Role.ORG_ADMIN:
                return [IsOrgAdminCreationAllowed()]

        return super().get_permissions()