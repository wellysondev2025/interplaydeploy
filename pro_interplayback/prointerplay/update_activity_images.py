import os
from django.conf import settings
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from core.models import Activity

activities_sem_imagem = Activity.objects.filter(path_relative_image__isnull=True)
print(f"Total de activities sem path_relative_image: {activities_sem_imagem.count()}")

media_root = settings.MEDIA_ROOT

for activity in activities_sem_imagem:
    encontrado = False
    # percorre todas as pastas dentro de media
    for root, dirs, files in os.walk(media_root):
        for arquivo in files:
            if activity.cod_activity in arquivo or str(activity.id) in arquivo:
                # constrói path relativo para salvar no banco
                relative_path = os.path.relpath(os.path.join(root, arquivo), media_root)
                activity.path_relative_image = relative_path.replace("\\", "/")  # cuidado com Windows
                activity.save()
                print(f"Atualizado Activity {activity.id}: {activity.path_relative_image}")
                encontrado = True
                break
        if encontrado:
            break
    if not encontrado:
        print(f"Nenhuma imagem encontrada para Activity {activity.id}")
