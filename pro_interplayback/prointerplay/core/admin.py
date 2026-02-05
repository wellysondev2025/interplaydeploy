from django.contrib import admin
from .models import Activity, Description, Professional

# Register your models here.
class DescriptionInline(admin.StackedInline):
    model = Description
    max_num = 1
    extra = 1
    fields = ('description',)

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('id', 'cod_activity', 'session', 'hash')
    inlines = [DescriptionInline]


from django.contrib import admin
from .models import Professional

admin.site.register(Professional)


from django.contrib import admin
from .models import Session, Patient  # importe os modelos que quiser visualizar

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'session_type', 'version_app', 'session_hash', 'start_date', 'end_date')
    search_fields = ('patient__name', 'session_hash', 'session_type')
    list_filter = ('session_type', 'version_app', 'start_date')

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'hash_patient')
    search_fields = ('name', 'hash_patient')
