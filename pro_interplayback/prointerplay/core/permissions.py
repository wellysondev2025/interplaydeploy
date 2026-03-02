from rest_framework.permissions import BasePermission
from django.conf import settings


class IsSuperUser(BasePermission):
    """
    Permissão exclusiva para o dono do sistema.
    """
    def has_permission(self, request, view):
        user = request.user
        return (
            user.is_authenticated and
            user.role == user.Role.SUPERUSER
        )


class IsProfessional(BasePermission):
    """
    Permite acesso apenas para usuários com role PROFESSIONAL.
    """
    def has_permission(self, request, view):
        user = request.user
        return (
            user.is_authenticated and
            user.role == user.Role.PROFESSIONAL
        )


class IsProfessionalOrSuperUser(BasePermission):
    """
    Permite acesso para SUPERUSER ou PROFESSIONAL.
    """
    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False

        return user.role in [
            user.Role.SUPERUSER,
            user.Role.PROFESSIONAL
        ]


class IsOwnerProfessionalOrSuperUser(BasePermission):
    """
    SUPERUSER pode acessar qualquer objeto.
    PROFESSIONAL só pode acessar o próprio objeto.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user

        if not user.is_authenticated:
            return False

        if user.role == user.Role.SUPERUSER:
            return True

        # Dono do objeto (ex: Professional vinculado ao próprio user)
        if hasattr(obj, "user") and obj.user == user:
            return True

        return False


class IsOrganizationAdminOrSuperUser(BasePermission):
    """
    SUPERUSER pode acessar qualquer objeto.
    ORG_ADMIN pode acessar apenas objetos da própria organização.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user

        if not user.is_authenticated:
            return False

        if user.role == user.Role.SUPERUSER:
            return True

        if (
            user.role == user.Role.ORG_ADMIN and
            hasattr(obj, "organization") and
            obj.organization == user.organization
        ):
            return True

        return False


class IsProfessionalAccessAllowed(BasePermission):
    """
    SUPERUSER → tudo
    ORG_ADMIN → apenas profissionais da própria organização
    PROFESSIONAL → apenas seu próprio perfil
    """

    def has_object_permission(self, request, view, obj):
        user = request.user

        if not user.is_authenticated:
            return False

        # Superuser pode tudo
        if user.role == user.Role.SUPERUSER:
            return True

        # Org Admin da mesma organização
        if (
            user.role == user.Role.ORG_ADMIN and
            obj.user.organization == user.organization
        ):
            return True

        # Dono do perfil
        if obj.user == user:
            return True

        return False


class IsProfessionalCreateAllowed(BasePermission):
    """
    Apenas SUPERUSER e ORG_ADMIN podem criar profissionais.
    ORG_ADMIN só pode criar profissional na própria organização
    (validação complementar deve ocorrer na view).
    """

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False

        return user.role in [
            user.Role.SUPERUSER,
            user.Role.ORG_ADMIN
        ]


class IsOrgAdminCreationAllowed(BasePermission):
    """
    Apenas SUPERUSER pode criar Organization Admin.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False

        return user.role == user.Role.SUPERUSER


class GameAPIKeyPermission(BasePermission):
    """
    Permite acesso apenas se a API Key enviada no header
    for igual à configurada no servidor.
    """

    def has_permission(self, request, view):
        api_key = request.headers.get("X-API-KEY")
        return api_key == settings.GAME_API_KEY