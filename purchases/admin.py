from django.contrib import admin
from .models import Supplier, Purchase, PurchaseDetail

admin.site.register(Supplier)
admin.site.register(Purchase)
admin.site.register(PurchaseDetail)