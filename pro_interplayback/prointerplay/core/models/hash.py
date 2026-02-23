from django.db import models



# ---------------------------
# HashModel
# ---------------------------
class HashModel(models.Model):
    hash = models.CharField(max_length=100, unique=True)
    request_date = models.DateTimeField(auto_now_add=True)
    device = models.CharField(max_length=100)

    def __str__(self):
        return self.hash
