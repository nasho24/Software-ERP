"""
URL configuration for erp_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, MyTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

# 1. Creamos el router para las rutas que NO están en carpetas separadas
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # --- API DE USUARIOS (El router que acabamos de crear) ---
    path('api/', include(router.urls)), 

    # --- AUTENTICACIÓN ---
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # --- RUTAS DE MÓDULOS ---
    path('api/purchases/', include('purchases.urls')),
    path('api/inventory/', include('inventory.urls')), 
    path('api/sales/', include('sales.urls')), 
]