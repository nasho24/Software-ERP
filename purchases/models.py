from django.db import models
from inventory.models import Product
from django.contrib.auth.models import User

class Supplier(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=200)
    # LE QUITAMOS EL unique=True DE AQUÍ:
    rut = models.CharField(max_length=12)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        # El proveedor es único por combinación de RUT y Usuario
        constraints = [
            models.UniqueConstraint(fields=['user', 'rut'], name='unique_supplier_per_user')
        ]

    def __str__(self):
        return f"{self.name} ({self.rut})"

class Purchase(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"Compra #{self.id} - {self.supplier.name}"

class PurchaseDetail(models.Model):
    purchase = models.ForeignKey(Purchase, related_name='details', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    cost_price = models.DecimalField(max_digits=12, decimal_places=2) 

    def save(self, *args, **kwargs):
        if not self.pk:
            self.product.stock += self.quantity
            self.product.save()
        super().save(*args, **kwargs)