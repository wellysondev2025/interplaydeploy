from rest_framework.permissions import BasePermission
from django.conf import settings


class IsSuperUser(BasePermission):
    """
    Permissão exclusiva para o dono do sistema.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


class IsProfessional(BasePermission):
    """
    Permite acesso apenas para usuários que possuem perfil profissional.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        return hasattr(request.user, "professional_profile")


class IsProfessionalOrSuperUser(BasePermission):
    """
    Permite acesso para SuperUser ou Professional.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        return hasattr(request.user, "professional_profile")


class IsOwnerProfessionalOrSuperUser(BasePermission):
    """
    SuperUser pode acessar qualquer objeto.
    Professional só pode acessar objetos ligados ao seu perfil.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True

        professional = getattr(request.user, "professional_profile", None)
        if not professional:
            return False

        return obj == professional


class GameAPIKeyPermission(BasePermission):
    """
    Permite acesso apenas se a API Key enviada no header
    for igual à configurada no servidor.
    """

    def has_permission(self, request, view):
        api_key = request.headers.get("X-API-KEY")
        return api_key == settings.GAME_API_KEY