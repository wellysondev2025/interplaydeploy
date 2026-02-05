from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.super_user
        )


class IsProfessionalOrAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.super_user:
            return True

        return hasattr(request.user, "professional_profile")


class IsOwnerProfessionalOrAdmin(BasePermission):
    """
    Para objetos ligados a profissional
    """

    def has_object_permission(self, request, view, obj):
        if request.user.super_user:
            return True

        professional = getattr(request.user, "professional_profile", None)
        if not professional:
            return False

        return obj.professional == professional


