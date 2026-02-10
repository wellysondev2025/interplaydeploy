from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.db.models import Count, Avg
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta

from core.models import Patient, Session, Activity
from core.permissions import IsProfessionalOrAdmin


class DashboardView(APIView):
    permission_classes = [IsProfessionalOrAdmin]

    def get(self, request):
        user = request.user

        # 🔐 Escopo de dados
        if user.is_superuser or user.admin:
            patients = Patient.objects.all()
        else:
            professional = user.professional_profile
            patients = Patient.objects.filter(professional=professional)



        sessions = Session.objects.filter(patient__in=patients)
        activities = Activity.objects.filter(session__patient__in=patients)

        # ======================
        # KPIs
        # ======================
        patients_count = patients.count()
        sessions_count = sessions.count()
        activities_count = activities.count()

        avg_session_time = (
            sessions
            .exclude(time_session__isnull=True)
            .aggregate(avg=Avg("time_session"))["avg"]
        )

        avg_session_time = round(avg_session_time or 0)

        # ======================
        # Sessões por mês (últimos 6)
        # ======================

        six_months_ago = timezone.now() - timedelta(days=180)

        sessions_by_month_qs = (
            sessions
            .filter(start_date__gte=six_months_ago)
            .annotate(month=TruncMonth("start_date"))
            .values("month")
            .annotate(total=Count("id"))
            .order_by("month")
        )

        sessions_by_month = [
            {
                "month": item["month"].strftime("%b/%Y"),
                "total": item["total"]
            }
            for item in sessions_by_month_qs
        ]

        # ======================
        # Últimas sessões
        # ======================
        last_sessions_qs = (
            sessions
            .select_related("patient")
            .annotate(activities_count=Count("activities"))
            .order_by("-start_date")[:5]
        )

        last_sessions = []
        for s in last_sessions_qs:
            last_sessions.append({
                "id": s.id,
                "patient_name": s.patient.name,
                "start_date": s.start_date,
                "session_type": s.session_type,
                "activities_count": s.activities_count,
                "finally_session": s.finally_session,
            })

        # ======================
        # RESPONSE FINAL
        # ======================
        return Response({
            "patients_count": patients_count,
            "sessions_count": sessions_count,
            "activities_count": activities_count,
            "avg_session_time": avg_session_time,

            "sessions_by_month": sessions_by_month,
            "last_sessions": last_sessions
        }, status=status.HTTP_200_OK)
