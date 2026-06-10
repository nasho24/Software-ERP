from django.db import models
from inventory.models import Product 
from django.contrib.auth.models import User

class Customer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=200, verbose_name="Nombre / Razón Social")
    # LE QUITAMOS EL unique=True DE AQUÍ:
    rut = models.CharField(max_length=20, verbose_name="RUT") 
    email = models.EmailField(blank=True, null=True, verbose_name="Correo")

    class Meta:
        # Hacemos que el RUT sea único SOLO para cada usuario particular
        constraints = [
            models.UniqueConstraint(fields=['user', 'rut'], name='unique_customer_per_user')
        ]

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
    
    def save(self, *args, **kwargs):
        if not self.pk: 
            self.product.stock -= self.quantity
            self.product.save() 
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"