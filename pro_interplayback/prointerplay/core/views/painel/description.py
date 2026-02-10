from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from core.models import Activity, Description
from core.permissions import IsAdmin


class DescriptionUpdateView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        activity_hash = request.data.get("activity_hash")
        description_text = request.data.get("description", "")

        if not activity_hash:
            return Response(
                {"success": False, "error": "activity_hash é obrigatório"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            activity = Activity.objects.get(hash=activity_hash)
        except Activity.DoesNotExist:
            return Response(
                {"success": False, "error": "Atividade não encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )

        # 🔐 regra de acesso
        user = request.user
        if not (user.is_superuser or user.admin):
            professional = getattr(user, "professional_profile", None)
            if not professional or activity.session.patient.professional != professional:
                return Response(
                    {"success": False, "error": "Acesso negado"},
                    status=status.HTTP_403_FORBIDDEN
                )

        description, _ = Description.objects.get_or_create(activity=activity)
        description.description = description_text
        description.save()

        return Response({
            "success": True,
            "description": description.description
        })
