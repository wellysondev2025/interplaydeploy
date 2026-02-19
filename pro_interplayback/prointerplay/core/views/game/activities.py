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
        # Recebendo dados
        session_hash = request.data.get('session_hash')
        cod_activity = request.data.get('cod_activity')
        duration = request.data.get('duration')
        image_base64 = request.data.get('image', '')
        path_relative_image_input = request.data.get('path_relative_image', '')  # Novo campo para testes

        if session_hash is None or cod_activity is None or duration is None:
            return Response(
                {'success': False, 'msg': 'Dados incompletos'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Buscar sessão
        try:
            session = Session.objects.get(session_hash=session_hash)
        except Session.DoesNotExist:
            return Response(
                {'success': False, 'msg': 'Sessão não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )

        patient = session.patient
        raw_string = f"{cod_activity}{session.session_hash}{patient.hash_patient}"
        hash_activity = hashlib.sha256(raw_string.encode()).hexdigest()

        # Criar a atividade
        activity = Activity(
            session=session,
            cod_activity=cod_activity,
            duration=duration,
            hash=hash_activity,
            end_date_activity=timezone.now()
        )
        activity.save()

        path_relative_image = ''

        # 1️⃣ Se veio imagem em base64 (fluxo normal do game)
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
                return Response(
                    {'success': False, 'msg': f'Erro ao salvar imagem: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        # 2️⃣ Se veio path_relative_image diretamente (teste via Postman)
        elif path_relative_image_input:
            path_relative_image = path_relative_image_input.lstrip("/")  # remove barra inicial se existir
            activity.path_relative_image = path_relative_image
            activity.save()

        # Finaliza sessão se necessário
        if not session.finally_session:
            session.end_date = timezone.now()
            session.time_session = int((session.end_date - session.start_date).total_seconds())
            session.finally_session = True
            session.save()

        serializer = ActivitySerializer(activity)
        return Response(
            {'success': True, 'activity': serializer.data, 'path_image': path_relative_image},
            status=status.HTTP_201_CREATED
        )
