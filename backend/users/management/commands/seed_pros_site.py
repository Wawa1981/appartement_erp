"""
Coworkers listés sur la fiche publique L'Appartement 137
+ services / lieux du site lappartement137.com

Coworkers : Fabrice, Lorena, Amad, Marjorie, Roxane
Espaces : 16 passage Lemoine / 80 rue de Cléry — 06 21 32 15 96

Usage :
  python manage.py seed_pros_site
"""

from datetime import date, time, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from users.models import Reservation, ReservationStatus, UserRole

User = get_user_model()

PRO_PASSWORD = "pro123"

# 5 coworkers de la fiche + profils métier alignés inventaire site
PROS = [
    {
        "email": "fabrice@test.lappartement137.com",
        "username": "fabrice_137",
        "first_name": "Fabrice",
        "last_name": "Martin",
        "phone": "06 21 32 15 96",
        "specialties": ["coiffure", "barbier"],
        "bio": (
            "Coworker L'Appartement 137 — coiffure & barbier. "
            "Présent sur l'espace coworking beauté Paris 2e "
            "(16 passage Lemoine, 75002). "
            "Formules premium & classiques sur book-online."
        ),
        "resa": {
            "espace": "137",
            "poste": "Premium A",
            "poste_id": "137-premium-1",
            "type_poste": "premium",
            "address": "16 passage Lemoine, 75002",
            "montant": Decimal("16.00"),
            "service_id": "premium-heure",
            "start_time": time(10, 0),
            "end_time": time(11, 0),
        },
    },
    {
        "email": "lorena@test.lappartement137.com",
        "username": "lorena_137",
        "first_name": "Lorena",
        "last_name": "Silva",
        "phone": "06 21 32 15 96",
        "specialties": ["coiffure"],
        "bio": (
            "Coworker L'Appartement 137 — coiffure. "
            "Rencontrez Lorena à l'Appartement 137, Paris 2e. "
            "Location de poste classique / premium à la carte."
        ),
        "resa": {
            "espace": "137",
            "poste": "Classique 1",
            "poste_id": "137-classique-1",
            "type_poste": "classique",
            "address": "16 passage Lemoine, 75002",
            "montant": Decimal("11.00"),
            "service_id": "classique-heure",
            "start_time": time(14, 0),
            "end_time": time(15, 0),
        },
    },
    {
        "email": "amad@test.lappartement137.com",
        "username": "amad_137",
        "first_name": "Amad",
        "last_name": "Diallo",
        "phone": "06 21 32 15 96",
        "specialties": ["barbier"],
        "bio": (
            "Coworker L'Appartement 137 — barbier. "
            "Fauteuils barbier de l'Appartement 137 (2 postes). "
            "Réservation via le coworking Paris 2e."
        ),
        "resa": {
            "espace": "137",
            "poste": "Barbier 1",
            "poste_id": "137-barbier-1",
            "type_poste": "barbier",
            "address": "16 passage Lemoine, 75002",
            "montant": Decimal("16.00"),
            "service_id": "premium-heure",
            "start_time": time(11, 0),
            "end_time": time(12, 0),
        },
    },
    {
        "email": "marjorie@test.lappartement137.com",
        "username": "marjorie_80",
        "first_name": "Marjorie",
        "last_name": "Petit",
        "phone": "06 21 32 15 96",
        "specialties": ["esthetique"],
        "bio": (
            "Coworker L'Appartement — esthétique. "
            "Cabine esthétique de l'Appartement 80 (80 rue de Cléry). "
            "Soins et rendez-vous à la carte (tarifs cabine book-online)."
        ),
        "resa": {
            "espace": "80",
            "poste": "Cabine esthétique",
            "poste_id": "80-cabine-1",
            "type_poste": "cabine",
            "address": "80 rue de Cléry, 75002",
            "montant": Decimal("16.00"),
            "service_id": "cabine-heure",
            "start_time": time(9, 30),
            "end_time": time(10, 30),
        },
    },
    {
        "email": "roxane@test.lappartement137.com",
        "username": "roxane_80",
        "first_name": "Roxane",
        "last_name": "Bernard",
        "phone": "06 21 32 15 96",
        "specialties": ["coiffure", "nail"],
        "bio": (
            "Coworker L'Appartement — coiffure & nail art. "
            "Poste sur les 16 fauteuils de l'Appartement 80. "
            "Location flexible demi-heure à la journée."
        ),
        "resa": {
            "espace": "80",
            "poste": "Fauteuil 1",
            "poste_id": "80-fauteuil-1",
            "type_poste": "fauteuil",
            "address": "80 rue de Cléry, 75002",
            "montant": Decimal("11.00"),
            "service_id": "location-heure",
            "start_time": time(15, 0),
            "end_time": time(16, 0),
        },
    },
]


class Command(BaseCommand):
    help = "Seed coworkers fiche Google (Fabrice, Lorena, Amad, Marjorie, Roxane)"

    def handle(self, *args, **options):
        tomorrow = date.today() + timedelta(days=1)
        created_users = 0
        created_resas = 0

        # retire anciens comptes test génériques
        User.objects.filter(email__endswith="@test.lappartement137.com").exclude(
            email__in=[p["email"] for p in PROS]
        ).delete()

        for p in PROS:
            user, created = User.objects.get_or_create(
                email=p["email"],
                defaults={
                    "username": p["username"],
                    "first_name": p["first_name"],
                    "last_name": p["last_name"],
                    "role": UserRole.PROFESSIONNEL,
                    "phone": p["phone"],
                    "bio": p["bio"],
                    "specialties": p["specialties"],
                    "is_active": True,
                },
            )
            user.username = p["username"]
            user.first_name = p["first_name"]
            user.last_name = p["last_name"]
            user.phone = p["phone"]
            user.bio = p["bio"]
            user.specialties = p["specialties"]
            user.role = UserRole.PROFESSIONNEL
            user.is_active = True
            user.set_password(PRO_PASSWORD)
            user.save()
            if created:
                created_users += 1
                self.stdout.write(self.style.SUCCESS(f"+ {user.first_name} <{user.email}>"))
            else:
                self.stdout.write(f"= {user.first_name} <{user.email}>")

            rmeta = p["resa"]
            exists = Reservation.objects.filter(
                user=user, poste_id=rmeta["poste_id"], date=tomorrow
            ).exists()
            if not exists:
                Reservation.objects.create(
                    user=user,
                    espace=rmeta["espace"],
                    poste=rmeta["poste"],
                    poste_id=rmeta["poste_id"],
                    type_poste=rmeta["type_poste"],
                    date=tomorrow,
                    start_time=rmeta["start_time"],
                    end_time=rmeta["end_time"],
                    montant=rmeta["montant"],
                    statut=ReservationStatus.A_VENIR,
                    address=rmeta["address"],
                    service_id=rmeta["service_id"],
                )
                created_resas += 1
                self.stdout.write(
                    self.style.SUCCESS(f"  + resa {rmeta['poste']} {tomorrow}")
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"OK — users_new={created_users} resas_new={created_resas} · mdp={PRO_PASSWORD}"
            )
        )
