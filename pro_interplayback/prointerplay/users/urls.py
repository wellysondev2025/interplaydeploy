from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import MeView, UserViewSet

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")  # ✅ nome explícito

urlpatterns = [
    path("me/", MeView.as_view()),  # rota /api/users/me/
]

urlpatterns += router.urls