from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from core.models import Professional, Patient, Session


class DashboardView(APIView):
    """
    Dashboard de métricas do sistema.

    SuperUser:
        - Visualiza métricas globais do sistema.

    Professional:
        - Visualiza apenas métricas relacionadas ao seu perfil.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.is_superuser:
            return self._superuser_dashboard()

        if hasattr(user, "professional_profile"):
            return self._professional_dashboard(user)

        return Response({"detail": "Sem permissão para acessar o dashboard."}, status=403)

    # =============================
    # MÉTRICAS SUPERUSER
    # =============================

    def _superuser_dashboard(self):
        data = {
            "total_professionals": Professional.objects.count(),
            "total_patients": Patient.objects.count(),
            "total_sessions": Session.objects.count(),
            "sessions_by_type": list(
                Session.objects.values("session_type")
                .annotate(total=Count("id"))
            ),
        }

        return Response(data)

    # =============================
    # MÉTRICAS PROFESSIONAL
    # =============================

    def _professional_dashboard(self, user):
        professional = user.professional_profile

        data = {
            "total_patients": Patient.objects.filter(professional=professional).count(),
            "total_sessions": Session.objects.filter(professional=professional).count(),
            "sessions_by_type": list(
                Session.objects.filter(professional=professional)
                .values("session_type")
                .annotate(total=Count("id"))
            ),
        }

        return Response(data)
