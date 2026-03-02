# organizations/models.py
from django.db import models

class Organization(models.Model):
    name = models.CharField(max_length=255, unique=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_solo = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    

class OrganizationInvite(models.Model):

    class Role(models.TextChoices):
        ORG_ADMIN = "org_admin", "Organization Admin"
        PROFESSIONAL = "professional", "Professional"

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="invites"
    )

    email = models.EmailField()
    role = models.CharField(max_length=30, choices=Role.choices)

    token = models.UUIDField(unique=True, editable=False)
    is_used = models.BooleanField(default=False)

    expires_at = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)