from rest_framework.throttling import SimpleRateThrottle


class GameRateThrottle(SimpleRateThrottle):
    scope = "game"

    def get_cache_key(self, request, view):
        return self.get_ident(request)