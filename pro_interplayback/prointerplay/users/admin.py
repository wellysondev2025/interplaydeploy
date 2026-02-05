# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

class UserAdmin(BaseUserAdmin):
    # Campos que aparecem na listagem
    list_display = ('email', 'name', 'is_staff', 'is_superuser', 'blocked', 'admin')
    list_filter = ('is_staff', 'is_superuser', 'blocked', 'admin')
    
    # Campos do formulário de edição
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informações Pessoais', {'fields': ('name',)}),
        ('Permissões', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions', 'blocked', 'admin', 'super_user')}),
    )
    
    # Campos do formulário de criação
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'password1', 'password2', 'is_staff', 'is_superuser'),
        }),
    )

    search_fields = ('email', 'name')
    ordering = ('email',)

# Registrar no admin
admin.site.register(User, UserAdmin)
