from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class UserRole(models.TextChoices):
    ADMIN = "ADMIN", "Administrateur"
    PROFESSIONNEL = "PROFESSIONNEL", "Professionnel"


class User(AbstractUser):
    """Utilisateur custom AUTH_USER_MODEL."""

    email = models.EmailField(unique=True, verbose_name="Adresse email")
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.PROFESSIONNEL,
        verbose_name="Rôle",
    )
    phone = models.CharField(max_length=30, blank=True, default="", verbose_name="Téléphone")
    bio = models.TextField(blank=True, default="", verbose_name="Bio professionnelle")
    specialties = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Spécialités",
        help_text="Liste d'ids : coiffure, esthetique, barbier, nail",
    )
    notify_reminder = models.BooleanField(default=True)
    notify_payment = models.BooleanField(default=True)
    notify_slots = models.BooleanField(default=False)
    notify_newsletter = models.BooleanField(default=False)

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


class ReservationStatus(models.TextChoices):
    A_VENIR = "a_venir", "À venir"
    TERMINE = "termine", "Terminé"
    ANNULE = "annule", "Annulé"
    EN_COURS = "en_cours", "En cours"


class Reservation(models.Model):
    """Réservation poste — source de vérité API (pas de mock front)."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reservations",
    )
    espace = models.CharField(max_length=8, verbose_name="Espace (137/80)")
    poste = models.CharField(max_length=64, verbose_name="Libellé poste")
    poste_id = models.CharField(max_length=64, blank=True, default="")
    type_poste = models.CharField(max_length=32, verbose_name="Type")
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    montant = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    statut = models.CharField(
        max_length=16,
        choices=ReservationStatus.choices,
        default=ReservationStatus.A_VENIR,
    )
    address = models.CharField(max_length=255, blank=True, default="")
    service_id = models.CharField(max_length=64, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-start_time"]
        verbose_name = "Réservation"
        verbose_name_plural = "Réservations"

    def __str__(self):
        return f"{self.espace} {self.poste} {self.date} ({self.user_id})"
