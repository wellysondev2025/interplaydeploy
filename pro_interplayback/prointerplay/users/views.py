from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .serializers import UserSerializer
User = get_user_model()

# Create your views here.
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "admin": user.admin,
            "super_user": user.super_user,
        })

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]  # apenas admins podem listar