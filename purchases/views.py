from rest_framework import viewsets
from .models import Supplier, Purchase, PurchaseDetail
from .serializers import SupplierSerializer, PurchaseSerializer, PurchaseDetailSerializer

class SupplierViewSet(viewsets.ModelViewSet):
    serializer_class = SupplierSerializer
    queryset = Supplier.objects.all()  
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return self.queryset.model.objects.all()
        return self.queryset.model.objects.filter(user=user)

    def perform_create(self, serializer):
            # Cuando el cliente crea un producto, se le asigna a él automáticamente
        serializer.save(user=self.request.user)

class PurchaseViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Purchase.objects.all()
        return Purchase.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PurchaseDetailViewSet(viewsets.ModelViewSet):
    queryset = PurchaseDetail.objects.all()
    serializer_class = PurchaseDetailSerializer