import os
import django
from django.core.management import call_command
from django.contrib.auth import get_user_model

# Configurações Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

print("🚀 Iniciando reset do banco de dados...")

# Limpa tudo
call_command("flush", "--noinput")  # remove todos os dados
print("✅ Banco de dados limpo")

# Aplica todas as migrations
call_command("migrate")
print("✅ Migrations aplicadas")

# Cria superuser inicial
User = get_user_model()
if not User.objects.filter(username="admin").exists():
    User.objects.create_superuser("admin", "admin@example.com", "admin123")
    print("✅ Superuser 'admin' criado")
else:
    print("⚠️ Superuser 'admin' já existe")

print("🎉 Reset completo!")