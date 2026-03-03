from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
from core.permissions import IsOrgAdminCreationAllowed

User = get_user_model()


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


# ------------------------
# Object-level permission
# ------------------------
class IsTenantAndNotSuperuser(permissions.BasePermission):
    """
    Regra de acesso a objetos:
    - SUPERUSER pode acessar todos
    - ORG_ADMIN só acessa usuários da própria org, exceto superusers
    - PROFESSIONAL só acessa ele mesmo
    """

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.is_superuser:
            return True

        if user.role == User.Role.ORG_ADMIN:
            return obj.organization == user.organization and obj.role != User.Role.SUPERUSER

        # PROFESSIONAL só pode acessar a si mesmo
        return obj == user


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsTenantAndNotSuperuser]

    def get_queryset(self):
        user = self.request.user

        # SUPERUSER → vê todos
        if user.is_superuser:
            return User.objects.all()

        # ORG_ADMIN → vê apenas usuários da própria organização, exceto superusers
        if user.role == User.Role.ORG_ADMIN:
            return User.objects.filter(
                organization=user.organization
            ).exclude(role=User.Role.SUPERUSER)

        # PROFESSIONAL → vê apenas a si mesmo
        return User.objects.filter(id=user.id)

    def get_permissions(self):
        """
        Controle de criação:
        - SUPERUSER pode criar qualquer usuário
        - ORG_ADMIN só pode criar PROFESSIONAL
        """
        if self.request.method == "POST":
            role = self.request.data.get("role")

            # Bloquear criação de SUPERUSER ou ORG_ADMIN por quem não é superuser
            if role in [User.Role.SUPERUSER, User.Role.ORG_ADMIN] and not self.request.user.is_superuser:
                raise PermissionDenied("Você não tem permissão para criar esse tipo de usuário.")

            # Se estiver tentando criar ORG_ADMIN (superuser pode criar)
            if role == User.Role.ORG_ADMIN:
                return [IsOrgAdminCreationAllowed()]

        return super().get_permissions()