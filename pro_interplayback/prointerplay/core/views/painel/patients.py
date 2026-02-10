from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from core.models import Patient, Session, Activity, Description
from core.permissions import IsProfessionalOrAdmin


class PatientListView(APIView):
    """
    Retorna todos os pacientes do profissional logado.
    Superuser vê todos os pacientes.
    Cada paciente traz suas sessões e atividades.
    """
    permission_classes = [IsProfessionalOrAdmin]

    def get(self, request):
        user = request.user

        if user.is_superuser or user.admin:
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