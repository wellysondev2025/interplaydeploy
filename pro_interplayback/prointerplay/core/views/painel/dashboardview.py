from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Avg
from django.db.models.functions import TruncMonth
from core.models import Professional, Patient, Session


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.is_superuser:
            return self._superuser_dashboard()

        if hasattr(user, "professional_profile"):
            return self._professional_dashboard(user)

        return Response({"detail": "Sem permissão para acessar o dashboard."}, status=403)

    # =============================
    # SUPERUSER
    # =============================

    def _superuser_dashboard(self):
        sessions = Session.objects.all()

        data = {
            "professionals_count": Professional.objects.count(),
            "patients_count": Patient.objects.count(),
            "sessions_count": sessions.count(),
            "activities_count": 0,  # adicionar depois quando existir model Activity
            "avg_session_time": sessions.aggregate(avg=Avg("time_session"))["avg"] or 0,

            "sessions_by_month": list(
                sessions
                .annotate(month=TruncMonth("start_date"))
                .values("month")
                .annotate(total=Count("id"))
                .order_by("month")
            ),

            "last_sessions": list(
                sessions
                .select_related("patient")
                .order_by("-start_date")[:5]
                .values(
                    "id",
                    "start_date",
                    "session_type",
                    "finally_session",
                    "patient__name"
                )
            ),
        }

        # ajusta nome do campo para o frontend
        for session in data["last_sessions"]:
            session["patient_name"] = session.pop("patient__name")

        return Response(data)

    # =============================
    # PROFESSIONAL
    # =============================

    def _professional_dashboard(self, user):
        professional = user.professional_profile

        sessions = Session.objects.filter(
            patient__professional=professional
        )

        data = {
            "patients_count": Patient.objects.filter(
                professional=professional
            ).count(),

            "sessions_count": sessions.count(),

            "activities_count": 0,

            "avg_session_time": sessions.aggregate(avg=Avg("time_session"))["avg"] or 0,

            "sessions_by_month": list(
                sessions
                .annotate(month=TruncMonth("start_date"))
                .values("month")
                .annotate(total=Count("id"))
                .order_by("month")
            ),

            "last_sessions": list(
                sessions
                .select_related("patient")
                .order_by("-start_date")[:5]
                .values(
                    "id",
                    "start_date",
                    "session_type",
                    "finally_session",
                    "patient__name"
                )
            ),
        }

        for session in data["last_sessions"]:
            session["patient_name"] = session.pop("patient__name")

        return Response(data)
