from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from django.utils import timezone
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

import base64
import hashlib
import os

from core.models import Patient, Session, Activity, Description, Professional
from core.serializers import (
    SessionSerializer,
    ActivitySerializer,
    DescriptionSerializer
)



class PatientCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        name = request.data.get("name")
        date_nasc = request.data.get("date_nasc")
        code = request.data.get("code")

        if not all([name, date_nasc, code]):
            return Response({"success": False, "data": {}, "message": "Dados incompletos"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            professional = Professional.objects.get(code=code)
        except Professional.DoesNotExist:
            return Response({"success": False, "data": {}, "message": "Código do profissional inválido"}, status=status.HTTP_404_NOT_FOUND)

        patient, created = Patient.objects.get_or_create(name=name, date_nasc=date_nasc, professional=professional)

        return Response({
            "success": True,
            "data": {"hash_patient": str(patient.hash_patient), "name": patient.name},
            "message": "Paciente criado com sucesso" if created else "Paciente já existente"
        }, status=status.HTTP_201_CREATED)


class PatientGetByHashView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        hash_patient = request.data.get("hash")
        if not hash_patient:
            return Response({"success": False, "error": "hash não enviado"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            patient = Patient.objects.get(hash_patient=hash_patient)
            return Response({"success": True, "patient": {"name": patient.name, "date_nasc": str(patient.date_nasc)}})
        except Patient.DoesNotExist:
            return Response({"success": False, "error": "Paciente não encontrado"}, status=status.HTTP_404_NOT_FOUND)


# ---------------------------
# SESSION VIEWS
# ---------------------------

@method_decorator(csrf_exempt, name='dispatch')
class SessionCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        version_app = request.data.get('version_app', '')
        session_type = request.data.get('session_type', '')
        hash_patient = request.data.get('hash_patient')

        if not hash_patient:
            return Response({'success': False, 'msg': 'hash_patient é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            patient = Patient.objects.get(hash_patient=hash_patient)
        except Patient.DoesNotExist:
            return Response({"success": False, "error": "Paciente não encontrado"}, status=status.HTTP_404_NOT_FOUND)

        session = Session.objects.create(patient=patient, session_type=session_type, version_app=version_app)
        serializer = SessionSerializer(session)
        return Response({'success': True, 'session': serializer.data}, status=status.HTTP_201_CREATED)


class SessionFinalizeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        session_hash = request.data.get('session_hash')

        try:
            session = Session.objects.get(session_hash=session_hash)
        except Session.DoesNotExist:
            return Response({'success': False, 'msg': 'Sessão não encontrada'}, status=status.HTTP_404_NOT_FOUND)

        if not session.finally_session:
            session.end_date = timezone.now()
            session.time_session = int((session.end_date - session.start_date).total_seconds())
            session.finally_session = True
            session.save()
    
        serializer = SessionSerializer(session)
        return Response({'success': True, 'session': serializer.data})


# ---------------------------
# ACTIVITY VIEWS
# ---------------------------

class ActivityCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        session_hash = request.data.get('session_hash')
        cod_activity = request.data.get('cod_activity')
        duration = request.data.get('duration')
        image_base64 = request.data.get('image', '')

        if not all([session_hash, cod_activity, duration]):
            return Response({'success': False, 'msg': 'Dados incompletos'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = Session.objects.get(session_hash=session_hash)
        except Session.DoesNotExist:
            return Response({'success': False, 'msg': 'Sessão não encontrada'}, status=status.HTTP_404_NOT_FOUND)

        patient = session.patient
        raw_string = f"{cod_activity}{session.session_hash}{patient.hash_patient}"
        hash_activity = hashlib.sha256(raw_string.encode()).hexdigest()

        activity = Activity(
            session=session,
            cod_activity=cod_activity,
            duration=duration,
            hash=hash_activity,
            end_date_activity=timezone.now()
        )
        activity.save()

        path_relative_image = ''
        if image_base64:
            try:
                image_data = base64.b64decode(image_base64.split(",")[-1])
                folder_path = os.path.join(settings.MEDIA_ROOT, str(patient.id), str(session.id))
                os.makedirs(folder_path, exist_ok=True)
                safe_cod = "".join([c if c.isalnum() else "_" for c in cod_activity])
                file_name = f"{activity.id}_{safe_cod}.png"
                full_path = os.path.join(folder_path, file_name)
                with open(full_path, "wb") as f:
                    f.write(image_data)
                path_relative_image = f"{patient.id}/{session.id}/{file_name}"
                activity.path_relative_image = path_relative_image
                activity.save()
            except Exception as e:
                return Response({'success': False, 'msg': f'Erro ao salvar imagem: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if not session.finally_session:
            session.end_date = timezone.now()
            session.time_session = int((session.end_date - session.start_date).total_seconds())
            session.finally_session = True
            session.save()

        serializer = ActivitySerializer(activity)
        return Response({'success': True, 'activity': serializer.data, 'path_image': path_relative_image}, status=status.HTTP_201_CREATED)



class ProfessionalValidateView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        code = request.data.get("code")
        if not code:
            return Response({"success": False, "error": "Code is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            professional = Professional.objects.get(code=code)
            return Response({"success": True, "professional": {"id": professional.id, "name": professional.name}})
        except Professional.DoesNotExist:
            return Response({"success": False}, status=status.HTTP_404_NOT_FOUND)




class DescriptionUpdateView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        activity_hash = request.data.get('activity_hash')
        description_text = request.data.get('description', '')

        if not activity_hash:
            return Response({'success': False, 'error': 'activity_hash é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            activity = Activity.objects.get(hash=activity_hash)
        except Activity.DoesNotExist:
            return Response({'success': False, 'error': 'Activity não encontrada'}, status=status.HTTP_404_NOT_FOUND)

        description, created = Description.objects.get_or_create(activity=activity)
        description.description = description_text
        description.save()

        serializer = DescriptionSerializer(description)
        return Response({'success': True, 'description': serializer.data})
