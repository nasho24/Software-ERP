from django.contrib import admin
from .models import Customer, Sale, SaleDetail

# Esto permite agregar detalles (productos) dentro de la vista de la Venta
class SaleDetailInline(admin.TabularInline):
    model = SaleDetail
    extra = 1 # Muestra 1 fila vacía por defecto

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('rut', 'name', 'email')
    search_fields = ('rut', 'name')

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'date', 'total')
    inlines = [SaleDetailInline] #DETALLES DE LA VENTA

    