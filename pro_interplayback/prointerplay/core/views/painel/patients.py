from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Prefetch

from core.models import Patient, Session, Activity
from core.serializers.painel.patients import PatientPainelSerializer


class PatientListView(APIView):
    """
    Lista pacientes com sessões e atividades.

    SuperUser:
        - Vê todos os pacientes.

    Professional:
        - Vê apenas seus próprios pacientes.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # 1️⃣ Filtra pacientes
        if user.is_superuser:
            patients = Patient.objects.all()
        elif hasattr(user, "professional_profile"):
            patients = Patient.objects.filter(
                professional=user.professional_profile
            )
        else:
            return Response(
                {"detail": "Sem permissão"},
                status=status.HTTP_403_FORBIDDEN
            )

        # 2️⃣ Query otimizada
        patients = patients.select_related("professional").prefetch_related(
            Prefetch(
                "sessions",
                queryset=Session.objects.prefetch_related(
                    Prefetch(
                        "activities",
                        queryset=Activity.objects.select_related("description")
                    )
                ).order_by("-start_date")
            )
        )

        # 3️⃣ Serializa pacientes diretamente
        serializer = PatientPainelSerializer(
            patients,
            many=True,
            context={"request": request}  # necessário para image_url completo
        )

        # 4️⃣ Retorna resultado
        return Response(
            {"success": True, "patients": serializer.data},
            status=status.HTTP_200_OK
        )