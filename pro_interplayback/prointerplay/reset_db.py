# reset_db.py
import os
import django
from pathlib import Path
from dotenv import load_dotenv
from django.core.management import call_command

# -----------------------------
# Carrega .env local se existir
# -----------------------------
# Tenta .env.local primeiro, se não existir, tenta .env
env_path_local = Path(__file__).parent / ".env.local"
env_path_default = Path(__file__).parent / ".env"

if env_path_local.exists():
    load_dotenv(dotenv_path=env_path_local)
elif env_path_default.exists():
    load_dotenv(dotenv_path=env_path_default)

# -----------------------------
# Só roda se RESET_DB estiver definida
# -----------------------------
if os.environ.get("RESET_DB", "False") != "True":
    print("⚠️ RESET_DB não definido. Nada será feito. Defina RESET_DB=True para resetar o DB.")
    exit()

# -----------------------------
# Configura Django
# -----------------------------
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

print("🚀 Iniciando reset do banco de dados...")

# -----------------------------
# 1️⃣ Limpa todas as tabelas
# -----------------------------
call_command("flush", "--noinput")
print("✅ Banco de dados limpo")

# -----------------------------
# 2️⃣ Aplica todas as migrations
# -----------------------------
call_command("migrate")
print("✅ Migrations aplicadas")

# -----------------------------
# 3️⃣ Cria superuser
# -----------------------------
from django.contrib.auth import get_user_model

User = get_user_model()
username_field = User.USERNAME_FIELD  # usa o campo correto do User customizado

# Pega valores das variáveis de ambiente
username_value = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
email_value = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
password_value = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "admin123")

# Prepara kwargs para filtro e criação
filter_kwargs = {username_field: username_value}
create_kwargs = {username_field: username_value, "password": password_value}
# Se o modelo tiver email, adiciona ao superuser
if hasattr(User, "email"):
    create_kwargs["email"] = email_value

# Cria superuser se não existir
if not User.objects.filter(**filter_kwargs).exists():
    User.objects.create_superuser(**create_kwargs)
    print(f"✅ Superuser '{username_value}' criado com sucesso!")
else:
    print(f"⚠️ Superuser '{username_value}' já existe")

print("🎉 Reset do banco concluído!")