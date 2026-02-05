from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

from core.models import Patient, Session, Activity, Description, Professional
from core.serializers import (
    ProfessionalSerializer,
    ProfessionalCreateSerializer,
)
from core.permissions import IsAdmin, IsProfessionalOrAdmin
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
        if user.super_user:
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




class ProfessionalListCreateView(generics.ListCreateAPIView):
    queryset = Professional.objects.all()
    permission_classes = [IsAdmin]

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



class PatientListView(APIView):
    """
    Retorna todos os pacientes do profissional logado.
    Superuser vê todos os pacientes.
    Cada paciente traz suas sessões e atividades.
    """
    permission_classes = [IsProfessionalOrAdmin]

    def get(self, request):
        user = request.user

        if user.super_user:
            patients = Patient.objects.all()
        else:
            professional = user.professional_profile
            patients = Patient.objects.filter(professional=professional)

        result = []

        for patient in patients:
            sessions = Session.objects.filter(
                patient=patient
            ).order_by("-start_date")

            sessions_list = []

            for session in sessions:
                activities = Activity.objects.filter(session=session)

                activities_list = []
                for activity in activities:
                    description = Description.objects.filter(activity=activity).first()

                    activities_list.append({
                        "id": activity.id,
                        "cod_activity": activity.cod_activity,
                        "duration": activity.duration,
                        "path_relative_image": activity.path_relative_image,
                        "hash": activity.hash,
                        "description": description.description if description else ""
                    })

                sessions_list.append({
                    "id": session.id,
                    "session_hash": session.session_hash,
                    "session_type": session.session_type,
                    "start_date": session.start_date,
                    "end_date": session.end_date,
                    "time_session": session.time_session,
                    "finally_session": session.finally_session,
                    "version_app": session.version_app,
                    "activities": activities_list
                })

            result.append({
                "id": patient.id,
                "name": patient.name,
                "date_nasc": patient.date_nasc,
                "hash_patient": patient.hash_patient,
                "professional": {
                    "name": patient.professional.name,
                    "code": patient.professional.code,
                    "cpf": patient.professional.cpf,
                    "address": patient.professional.address,
                },                
                "sessions": sessions_list
            })

        return Response(
            {"success": True, "patients": result},
            status=status.HTTP_200_OK
        )



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
        if not user.super_user:
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
