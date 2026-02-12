from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Prefetch

from core.models import Patient, Session, Activity, Description


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

        # 🔥 OTIMIZAÇÃO DE QUERY
        patients = patients.select_related("professional").prefetch_related(
            Prefetch(
                "session_set",
                queryset=Session.objects.prefetch_related(
                    Prefetch(
                        "activities",
                        queryset=Activity.objects.prefetch_related("description")
                    )
                ).order_by("-start_date")
            )
        )

        result = []

        for patient in patients:
            sessions_list = []

            for session in patient.session_set.all():
                activities_list = []

                for activity in session.activities.all():
                    description = getattr(activity, "description", None)

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
