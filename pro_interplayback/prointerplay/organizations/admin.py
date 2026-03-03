from django.contrib import admin
from .models import Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "is_solo")
    search_fields = ("name",)
    list_filter = ("is_solo",)