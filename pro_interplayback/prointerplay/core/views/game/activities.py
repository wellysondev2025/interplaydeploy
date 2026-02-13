from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

import base64
import hashlib
import os

from django.conf import settings
from django.utils import timezone

from core.models import Activity, Session
from core.serializers import ActivitySerializer


class ActivityCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        session_hash = request.data.get('session_hash')
        cod_activity = request.data.get('cod_activity')
        duration = request.data.get('duration')
        image_base64 = request.data.get('image', '')

        if session_hash is None or cod_activity is None or duration is None:
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
