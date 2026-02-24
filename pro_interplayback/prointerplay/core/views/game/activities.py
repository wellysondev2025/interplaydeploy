# core/views/game/activities.py

import hashlib
import logging
import base64
import cloudinary.uploader

from django.db import transaction
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

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

        # ---------------------------
        # Validação básica
        # ---------------------------
        if not session_hash or not cod_activity:
            return Response(
                {"success": False, "msg": "Dados incompletos"},
                status=400
            )

        try:
            duration = int(duration)
        except (ValueError, TypeError):
            duration = None
            logger.warning(f"[ActivityCreate] Duration inválido recebido")

        try:
            session = Session.objects.get(session_hash=session_hash)
        except Session.DoesNotExist:
            return Response(
                {"success": False, "msg": "Sessão não encontrada"},
                status=404
            )

        # ---------------------------
        # Geração de hash
        # ---------------------------
        patient = session.patient
        now = timezone.now()

        hash_activity = hashlib.sha256(
            f"{cod_activity}{session.session_hash}{patient.hash_patient}{now.timestamp()}".encode()
        ).hexdigest()

        # ---------------------------
        # Criação da Activity
        # ---------------------------
        activity = Activity.objects.create(
            session=session,
            cod_activity=cod_activity,
            duration=duration,
            hash=hash_activity,
            end_date_activity=now,
        )

        # ---------------------------
        # Upload para Cloudinary
        # ---------------------------
        if image_base64:
            try:
                # Remove prefixo se existir
                if ";base64," in image_base64:
                    imgstr = image_base64.split(";base64,")[-1]
                else:
                    imgstr = image_base64

                imgstr = imgstr.strip()

                if not imgstr:
                    logger.warning(f"[ActivityCreate] Base64 vazio para Activity id={activity.id}")
                else:
                    upload_result = cloudinary.uploader.upload(
                        f"data:image/png;base64,{imgstr}",
                        folder="activities"
                    )

                    # Salva URL direta
                    activity.image = upload_result["secure_url"]
                    activity.save()

                    logger.info(
                        f"[ActivityCreate] Upload Cloudinary OK: {upload_result.get('secure_url')}"
                    )

            except Exception as e:
                logger.error(
                    f"[ActivityCreate] Erro ao enviar para Cloudinary: {e}",
                    exc_info=True
                )
                return Response(
                    {"success": False, "msg": f"Erro ao salvar imagem: {e}"},
                    status=500
                )
        else:
            logger.info(f"[ActivityCreate] Nenhuma imagem enviada para Activity id={activity.id}")

        # ---------------------------
        # Resposta
        # ---------------------------
        serializer = ActivitySerializer(activity)

        return Response(
            {
                "success": True,
                "activity": serializer.data,
                "image_url": activity.image if activity.image else None,
            },
            status=201
        )