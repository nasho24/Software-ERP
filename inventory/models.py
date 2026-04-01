from django.db import models
from django.contrib.auth.models import User

class Product(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    # Campos básicos del producto
    name = models.CharField(max_length=200, verbose_name="Nombre del Producto")
    #Unidad de Mantenimiento de Existencias
    sku = models.CharField(max_length=50, unique=True, verbose_name="Código SKU")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    
    # Precios y Cantidades
    # Usamos DecimalField para dinero, es mucho más exacto que FloatField
    price = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="Precio") 
    stock = models.IntegerField(default=0, verbose_name="Stock Disponible")
    
    # Auditoría
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última Actualización")

    def __str__(self):
        return f"[{self.sku}] {self.name} - Stock: {self.stock}"