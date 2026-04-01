from rest_framework import viewsets
from .models import Customer, Sale, SaleDetail
from .serializers import CustomerSerializer, SaleSerializer, SaleDetailSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Customer.objects.all()
        return Customer.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SaleViewSet(viewsets.ModelViewSet):
    serializer_class = SaleSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Sale.objects.all()
        
        # Si es un Cliente, solo ve las ventas asociadas a su usuario  
        return Sale.objects.filter(user=user)
    
    def perform_create(self, serializer):  
        # Al crear una venta, guardamos automáticamente quién la hizo
            serializer.save(user=self.request.user)

class SaleDetailViewSet(viewsets.ModelViewSet):
    queryset = SaleDetail.objects.all()
    serializer_class = SaleDetailSerializer
    