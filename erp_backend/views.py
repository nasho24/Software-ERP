from rest_framework import viewsets, permissions
from django.contrib.auth.models import User
from .serializers import UserSerializer, MyTokenObtainPairSerializer 
from rest_framework_simplejwt.views import TokenObtainPairView

# --- VISTA PARA EL TOKEN PERSONALIZADO ---
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# --- VISTA PARA GESTIÓN DE USUARIOS ---
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    # Solo el Admin puede ver la lista de usuarios
    permission_classes = [permissions.IsAdminUser]