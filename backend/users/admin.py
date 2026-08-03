from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Reservation, User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "role",
        "phone",
        "is_staff",
    )
    list_filter = ("role", "is_staff", "is_superuser", "is_active")
    fieldsets = UserAdmin.fieldsets + (
        (
            "Profil pro",
            {
                "fields": (
                    "role",
                    "phone",
                    "bio",
                    "specialties",
                    "notify_reminder",
                    "notify_payment",
                    "notify_slots",
                    "notify_newsletter",
                )
            },
        ),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Rôle ERP", {"fields": ("role",)}),
    )


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "espace",
        "poste",
        "date",
        "start_time",
        "end_time",
        "montant",
        "statut",
    )
    list_filter = ("espace", "statut", "type_poste", "date")
    search_fields = ("poste", "user__email", "user__first_name", "user__last_name")
