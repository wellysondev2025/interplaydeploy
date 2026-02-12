import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from users.models import User
from core.models import Professional

# ----- SuperUser -----
super_email = "welladmin@interplay.com"
super_password = "123456"
super_name = "Well Admin"

if not User.objects.filter(email=super_email).exists():
    User.objects.create_superuser(
        email=super_email,
        password=super_password,
        name=super_name
    )
    print(f"SuperUser criado: {super_email}")
else:
    print(f"SuperUser já existe: {super_email}")

# ----- Professional inicial -----
prof_email = "wellinteradmin@interplay.com"
prof_password = "123456"
prof_code = "PROF888"
prof_cpf = "12377633901"
prof_name = "Prof Well Admin"
prof_address = "Rua antonio, 123"

if not User.objects.filter(email=prof_email).exists():
    # cria user normal
    user = User.objects.create_user(
        email=prof_email,
        password=prof_password,
        name=prof_name,
        admin=False
    )
    # cria professional
    Professional.objects.create(
        user=user,
        code=prof_code,
        cpf=prof_cpf,
        name=prof_name,
        address=prof_address
    )
    print(f"Professional criado: {prof_name}")
else:
    print(f"Professional já existe: {prof_name}")
