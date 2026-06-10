from rest_framework import serializers
from .models import Customer, Sale, SaleDetail

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'
        read_only_fields = ['user']

class SaleSerializer(serializers.ModelSerializer):
    # Esto es un truco para que la API nos devuelva el nombre del cliente y no solo su ID numérico
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    
    class Meta:
        model = Sale
        fields = ['id', 'customer', 'customer_name', 'date', 'total']

class SaleDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleDetail
        fields = '__all__'
        