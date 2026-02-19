from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

import base64
import hashlib

from django.utils import timezone
from django.core.files.base import ContentFile

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

        # Criar atividade
        activity = Activity.objects.create(
            session=session,
            cod_activity=cod_activity,
            duration=duration,
            hash=hash_activity,
            end_date_activity=timezone.now()
        )

        # 🔥 SALVAR IMAGEM NO CLOUDINARY
        if image_base64:
            try:
                # Remove prefixo caso venha com "data:image/png;base64,"
                imgstr = image_base64.split(";base64,")[-1]

                image_file = ContentFile(
                    base64.b64decode(imgstr),
                    name=f"activity_{activity.id}.png"
                )

                # Isso automaticamente envia para o Cloudinary
                activity.image.save(image_file.name, image_file, save=True)

            except Exception as e:
                return Response(
                    {'success': False, 'msg': f'Erro ao salvar imagem: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        # Finaliza sessão se necessário
        if not session.finally_session:
            session.end_date = timezone.now()
            session.time_session = int(
                (session.end_date - session.start_date).total_seconds()
            )
            session.finally_session = True
            session.save()

        serializer = ActivitySerializer(activity)

        return Response(
            {
                'success': True,
                'activity': serializer.data,
                'image_url': activity.image.url if activity.image else None
            },
            status=status.HTTP_201_CREATED
        )