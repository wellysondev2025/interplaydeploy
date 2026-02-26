import hashlib
import cloudinary.uploader
from django.utils import timezone
from django.db import transaction
from core.models import Session, Activity


class ActivityService:

    @staticmethod
    @transaction.atomic
    def create_activity(session_hash, cod_activity, duration, image_base64):
        try:
            session = Session.objects.get(session_hash=session_hash)
        except Session.DoesNotExist:
            raise ValueError("Sessão não encontrada")

        try:
            duration = int(duration)
        except (ValueError, TypeError):
            duration = None

        now = timezone.now()
        patient = session.patient

        hash_activity = hashlib.sha256(
            f"{cod_activity}{session.session_hash}{patient.hash_patient}{now.timestamp()}".encode()
        ).hexdigest()

        activity = Activity.objects.create(
            session=session,
            cod_activity=cod_activity,
            duration=duration,
            hash=hash_activity,
            end_date_activity=now,
        )

        if image_base64:
            if ";base64," in image_base64:
                image_base64 = image_base64.split(";base64,")[-1]

            upload_result = cloudinary.uploader.upload(
                f"data:image/png;base64,{image_base64.strip()}",
                folder="activities"
            )

            activity.image = upload_result["secure_url"]
            activity.save()

        return activity