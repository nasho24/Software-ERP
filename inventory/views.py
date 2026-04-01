from rest_framework import viewsets
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    queryset = Product.objects.all() 

    def get_queryset(self):
        user = self.request.user
        # Si el usuario es Admin, ve todo
        if user.is_staff:
            return Product.objects.all()
        # Si es cliente, ve solo sus productos
        return Product.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)