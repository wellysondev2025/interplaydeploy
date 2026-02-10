from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and (
                request.user.is_superuser
                or request.user.admin
            )
        )


class IsProfessionalOrAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.user.is_superuser or request.user.admin:
            return True

        return hasattr(request.user, "professional_profile")



class IsOwnerProfessionalOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.admin:
            return True

        professional = getattr(request.user, "professional_profile", None)
        if not professional:
            return False

        return obj.professional == professional


