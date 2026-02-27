# organizations/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .models import Organization
from .serializers import OrganizationSerializer

class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [IsAdminUser]  # Apenas admins globais podem criar/editar