from rest_framework import generics
from core.models import Professional
from core.serializers import ProfessionalSerializer, ProfessionalCreateSerializer
from core.permissions import IsAdmin


class ProfessionalListCreateView(generics.ListCreateAPIView):
    queryset = Professional.objects.all()
    permission_classes = [IsAdmin]
    serializer_class = ProfessionalSerializer  # 👈 default

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProfessionalCreateSerializer
        return ProfessionalSerializer




class ProfessionalRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Professional.objects.all()
    serializer_class = ProfessionalSerializer
    permission_classes = [IsAdmin]

    def put(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
