from django.urls import path
from .views import MeView
from rest_framework.routers import DefaultRouter
from .views import MeView, UserViewSet

router = DefaultRouter()
router.register(r"", UserViewSet)  # rota principal de /api/users/

urlpatterns = [
    path("me/", MeView.as_view()),  # continua existindo
]

urlpatterns += router.urls