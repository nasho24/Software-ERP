from django.db import models
from inventory.models import Product 
from django.contrib.auth.models import User

class Customer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=200, verbose_name="Nombre / Razón Social")
    rut = models.CharField(max_length=20, unique=True, verbose_name="RUT") 
    email = models.EmailField(blank=True, null=True, verbose_name="Correo")

    def __str__(self):
        return f"{self.name} ({self.rut})"

class Sale(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    customer = models.ForeignKey(Customer, on_delete=models.RESTRICT, verbose_name="Cliente")
    date = models.DateTimeField(auto_now_add=True, verbose_name="Fecha")
    total = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Total Venta")

    def __str__(self):
        return f"Venta #{self.id} - {self.customer.name}"

class SaleDetail(models.Model):
    sale = models.ForeignKey(Sale, related_name='details', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.RESTRICT, verbose_name="Producto")
    quantity = models.IntegerField(verbose_name="Cantidad")
    price = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="Precio Unitario")
    
    # Sobrescribimos el método "save" para que haga cosas extras al guardar
    def save(self, *args, **kwargs):
        # Si es un registro nuevo (no tiene ID todavía)
        if not self.pk: 
            
            # 2. VAMOS AL INVENTARIO Y DESCONTAMOS EL STOCK
            self.product.stock -= self.quantity
            self.product.save() 
            
        super().save(*args, **kwargs) # Guardamos el detalle de la venta normalmente

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"