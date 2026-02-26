from rest_framework.response import Response
from core.serializers.game.activities import ActivitySerializer
from core.services.activity_service import ActivityService
from core.views.game.game_base import GameAPIView

class ActivityCreateView(GameAPIView):

    def post(self, request):
        session_hash = request.data.get("session_hash")
        cod_activity = request.data.get("cod_activity")
        duration = request.data.get("duration")
        image_base64 = request.data.get("image", "")

        if not session_hash or not cod_activity:
            return Response(
                {"success": False, "msg": "Dados incompletos"},
                status=400
            )

        try:
            activity = ActivityService.create_activity(
                session_hash=session_hash,
                cod_activity=cod_activity,
                duration=duration,
                image_base64=image_base64
            )
        except ValueError as e:
            return Response(
                {"success": False, "msg": str(e)},
                status=404
            )
        except Exception as e:
            return Response(
                {"success": False, "msg": f"Erro interno: {e}"},
                status=500
            )

        serializer = ActivitySerializer(activity)

        return Response(
            {
                "success": True,
                "activity": serializer.data,
                "image_url": activity.image if activity.image else None,
            },
            status=201
        )