# organizations/views.py

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from core.permissions import IsSuperUser
from .models import Organization
from .serializers import OrganizationSerializer


class OrganizationViewSet(viewsets.ModelViewSet):
    """
    CRUD completo de Organization.
    Acesso exclusivo para SUPERUSER.
    """

    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated, IsSuperUser]

    def get_queryset(self):
        return Organization.objects.all()