# core/views/game/activities.py
import base64
import hashlib
import logging
from django.core.files.base import ContentFile
from django.db import transaction
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from core.models import Session, Activity
from core.serializers import ActivitySerializer

logger = logging.getLogger(__name__)

class ActivityCreateView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        session_hash = request.data.get("session_hash")
        cod_activity = request.data.get("cod_activity")
        duration = request.data.get("duration")
        image_base64 = request.data.get("image", "")

        logger.info(
            f"[ActivityCreate] Recebido: session_hash={session_hash}, "
            f"cod_activity={cod_activity}, duration={duration}, "
            f"image_base64_length={len(image_base64) if image_base64 else 0}"
        )

        # Validação básica
        if not session_hash or not cod_activity:
            return Response(
                {"success": False, "msg": "Dados incompletos"}, status=400
            )

        try:
            duration = int(duration)
        except (ValueError, TypeError):
            duration = None
            logger.warning(f"[ActivityCreate] Duration inválido recebido: {duration}")

        try:
            session = Session.objects.get(session_hash=session_hash)
        except Session.DoesNotExist:
            return Response(
                {"success": False, "msg": "Sessão não encontrada"}, status=404
            )

        patient = session.patient
        now = timezone.now()
        hash_activity = hashlib.sha256(
            f"{cod_activity}{session.session_hash}{patient.hash_patient}{now.timestamp()}".encode()
        ).hexdigest()

        # 1️⃣ Cria Activity sem imagem primeiro
        activity = Activity(
            session=session,
            cod_activity=cod_activity,
            duration=duration,
            hash=hash_activity,
            end_date_activity=now,
        )
        activity.save()  # garante ID e inicializa CloudinaryField

        # 2️⃣ Recarrega a instância do DB para garantir que image não seja None
        activity.refresh_from_db()

        # 3️⃣ Salva a imagem corretamente
        if image_base64:
            try:
                # Remove prefixo se existir
                imgstr = image_base64.split(";base64,")[-1].strip()
                if imgstr:
                    decoded_file = base64.b64decode(imgstr)
                    # ✅ Aqui funciona com SQLite + Cloudinary
                    activity.image.save(f"activity_{activity.id}.png", ContentFile(decoded_file))
                    logger.info(
                        f"[ActivityCreate] Imagem salva com sucesso: id={activity.id}, "
                        f"tamanho={len(decoded_file)} bytes"
                    )
                else:
                    logger.warning(f"[ActivityCreate] Base64 vazio para Activity id={activity.id}")
            except Exception as e:
                logger.error(f"[ActivityCreate] Erro ao salvar imagem: {e}", exc_info=True)
                return Response(
                    {"success": False, "msg": f"Erro ao salvar imagem: {e}"}, status=500
                )
        else:
            logger.info(f"[ActivityCreate] Nenhuma imagem enviada para Activity id={activity.id}")

        # 4️⃣ Serializa e retorna
        serializer = ActivitySerializer(activity)
        return Response(
            {
                "success": True,
                "activity": serializer.data,
                "image_url": activity.image.url if activity.image else None,
            },
            status=201,
        )