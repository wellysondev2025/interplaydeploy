import base64
import hashlib
from django.core.files.base import ContentFile
from django.db import transaction
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from core.models import Session, Activity
from core.serializers import ActivitySerializer


class ActivityCreateView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        session_hash = request.data.get('session_hash')
        cod_activity = request.data.get('cod_activity')
        duration = request.data.get('duration')
        image_base64 = request.data.get('image', '')

        if not session_hash or not cod_activity:
            return Response({'success': False, 'msg': 'Dados incompletos'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            duration = int(duration)
        except (TypeError, ValueError):
            return Response({'success': False, 'msg': 'duration inválido'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = Session.objects.get(session_hash=session_hash)
        except Session.DoesNotExist:
            return Response({'success': False, 'msg': 'Sessão não encontrada'}, status=status.HTTP_404_NOT_FOUND)

        if session.finally_session:
            return Response({'success': False, 'msg': 'Sessão já finalizada'}, status=status.HTTP_400_BAD_REQUEST)

        patient = session.patient
        now = timezone.now()

        hash_activity = hashlib.sha256(f"{cod_activity}{session.session_hash}{patient.hash_patient}{now.timestamp()}".encode()).hexdigest()

        # Cria activity sem imagem
        activity = Activity.objects.create(
            session=session,
            cod_activity=cod_activity,
            duration=duration,
            hash=hash_activity,
            end_date_activity=now
        )

        # Só salva imagem se vier base64 válido
        if image_base64:
            try:
                imgstr = image_base64.split(";base64,")[-1].strip()
                if imgstr:
                    image_file = ContentFile(base64.b64decode(imgstr), name=f"activity_{activity.id}.png")
                    activity.image.save(image_file.name, image_file, save=True)
            except Exception as e:
                return Response({'success': False, 'msg': f'Erro ao salvar imagem: {str(e)}'},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        serializer = ActivitySerializer(activity)
        return Response({
            'success': True,
            'activity': serializer.data,
            'image_url': activity.image.url if activity.image else None
        }, status=status.HTTP_201_CREATED)