from django.contrib.auth.models import AbstractUser
from django.db import models


class UserRole(models.TextChoices):
    """Rôles utilisateurs (préparation pour Sprint 1)."""
    ADMIN = "ADMIN", "Administrateur"
    PROFESSIONNEL = "PROFESSIONNEL", "Professionnel"


class User(AbstractUser):
    """
    Modèle utilisateur custom.
    On l'ajoute dès le Sprint 0 car changer AUTH_USER_MODEL plus tard est très coûteux.
    """
    email = models.EmailField(unique=True, verbose_name="Adresse email")
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.PROFESSIONNEL,
        verbose_name="Rôle",
    )

    # On peut ajouter d'autres champs communs plus tard (phone, avatar, etc.)

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

    def __str__(self):
        return self.get_full_name() or self.username or self.email

    @property
    def is_admin(self):
        return self.role == UserRole.ADMIN

    @property
    def is_professionnel(self):
        return self.role == UserRole.PROFESSIONNEL

