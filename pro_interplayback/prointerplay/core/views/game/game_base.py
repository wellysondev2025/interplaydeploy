from rest_framework.views import APIView
from core.permissions import GameAPIKeyPermission
from core.views.game.throttles import GameRateThrottle



class GameAPIView(APIView):
    """
    Base view para todas as rotas do jogo.
    - Remove autenticação JWT
    - Exige API Key
    - Aplica rate limiting
    """

    authentication_classes = []
    permission_classes = [GameAPIKeyPermission]
    throttle_classes = [GameRateThrottle]