# users/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):

    list_display = (
        'email',
        'name',
        'role',
        'organization',
        'is_staff',
        'is_superuser',
        'is_active',
    )

    list_filter = (
        'role',
        'organization',
        'is_staff',
        'is_superuser',
        'is_active',
    )

    fieldsets = (
        (None, {'fields': ('email', 'password')}),

        ('Informações Pessoais', {
            'fields': ('name', 'organization')
        }),

        ('Permissões', {
            'fields': (
                'role',
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions',
            )
        }),
    )

    add_fieldsets = (
        (
            None,
            {
                'classes': ('wide',),
                'fields': (
                    'email',
                    'name',
                    'organization',
                    'role',
                    'password1',
                    'password2',
                    'is_staff',
                    'is_superuser',
                ),
            },
        ),
    )

    search_fields = ('email', 'name')
    ordering = ('email',)