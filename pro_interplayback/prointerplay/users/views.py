from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import viewsets
from django.contrib.auth import get_user_model
from .serializers import UserSerializer

User = get_user_model()

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "organization_admin": user.organization_admin,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "organization": user.organization.id if user.organization else None
        })

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return User.objects.all()
        elif user.organization_admin and user.organization:
            return User.objects.filter(organization=user.organization)
        else:
            # Profissionais isolados só veem a si mesmos
            return User.objects.filter(id=user.id)

    def get_permissions(self):
        user = self.request.user
        # Apenas superuser e org admin podem listar/editar outros usuários
        if self.action in ["list", "create", "update", "partial_update", "destroy"]:
            if user.is_superuser or (user.organization_admin and user.organization):
                return [IsAuthenticated()]
            return [IsAdminUser()]  # bloqueia outros
        return [IsAuthenticated()]