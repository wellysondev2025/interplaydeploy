from rest_framework import viewsets, generics
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
    

class OrganizationListView(generics.ListAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated, IsSuperUser]

    def get_queryset(self):
        # SUPERUSER vê todas as organizações
        return Organization.objects.all()