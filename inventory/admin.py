from django.contrib import admin
from .models import Product

# Esto personaliza cómo se ve la tabla en el panel de administrador
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('sku', 'name', 'price', 'stock') # Columnas que se muestran en la tabla
    search_fields = ('sku', 'name') # Agrega una barra de búsqueda
    list_filter = ('created_at',) # Agrega filtros laterales