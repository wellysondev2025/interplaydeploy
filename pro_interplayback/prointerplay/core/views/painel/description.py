from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from core.models import Activity, Description


class DescriptionUpdateView(APIView):
    """
    Atualiza ou cria descrição de uma atividade.

    SuperUser:
        - Pode alterar qualquer atividade.

    Professional:
        - Pode alterar apenas atividades vinculadas
          aos seus próprios pacientes.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        activity_hash = request.data.get("activity_hash")
        description_text = request.data.get("description", "")

        if not activity_hash:
            return Response(
                {"detail": "activity_hash é obrigatório"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            activity = Activity.objects.select_related(
                "session__patient__professional"
            ).get(hash=activity_hash)
        except Activity.DoesNotExist:
            return Response(
                {"detail": "Atividade não encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )

        user = request.user

        # 🔐 Regra de acesso
        if not user.is_superuser:
            if not hasattr(user, "professional_profile"):
                return Response(
                    {"detail": "Sem permissão"},
                    status=status.HTTP_403_FORBIDDEN
                )

            if activity.session.patient.professional != user.professional_profile:
                return Response(
                    {"detail": "Acesso negado"},
                    status=status.HTTP_403_FORBIDDEN
                )

        description, _ = Description.objects.get_or_create(activity=activity)
        description.description = description_text
        print(description)
        description.save()

        return Response({
            "success": True,
            "description": description.description
        })
