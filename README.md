L'Appartement ERP
=================

Plateforme ERP pour L'Appartement 137 et L'Appartement 80 (coworking beauté).

Stack
- Backend : Django 6, Django REST Framework, SimpleJWT
- Frontend : React 19, Vite, Tailwind CSS v4
- Base de données : PostgreSQL 16
- Environnement recommandé : Docker Compose

Sprint 0 : infrastructure, Docker, PostgreSQL, structure Django + React,
utilisateur custom, authentification JWT de base, CI.


1. Démarrage rapide (Docker)
---------------------------

Prérequis : Docker et Docker Compose.

    cp .env.example .env
    # Éditer .env : POSTGRES_PASSWORD et SECRET_KEY au minimum

    docker compose up --build -d

Services (ports par défaut, modifiables dans .env) :

    Frontend .............. http://localhost:5175
    API Django ............ http://localhost:8000
    Admin Django .......... http://localhost:8000/admin
    PostgreSQL (hôte) ..... localhost:5433

Commandes utiles :

    docker compose logs -f backend
    docker compose logs -f frontend
    docker compose exec backend python manage.py migrate
    docker compose exec backend python manage.py createsuperuser
    docker compose exec backend python manage.py test
    docker compose down
    docker compose down -v   # attention : efface aussi les données Postgres


2. Architecture
---------------

Services Docker
- db : PostgreSQL 16 (healthcheck)
- backend : Django + migrations au démarrage
- frontend : Vite en mode dev (hot-reload)

Structure du dépôt

    appartement_erp/
    ├── backend/
    │   ├── appartement_erp/     # settings, urls
    │   ├── users/               # modèle User custom, /api/users/me/
    │   ├── Dockerfile
    │   ├── manage.py
    │   └── requirements.txt
    ├── frontend/
    │   ├── src/
    │   ├── Dockerfile
    │   └── package.json
    ├── .github/workflows/ci.yml
    ├── docker-compose.yml
    ├── .env.example
    ├── .gitignore
    └── README.md

Le fichier .env n'est pas versionné. Copier .env.example vers .env en local.


3. Utilisateur custom
---------------------

Modèle users.User (AUTH_USER_MODEL) :
- héritage AbstractUser
- email unique
- champ role : ADMIN ou PROFESSIONNEL (préparation Sprint 1)

Créé dès le Sprint 0 pour éviter de changer AUTH_USER_MODEL plus tard.


4. Authentification JWT
-----------------------

Endpoints :
- POST /api/token/          login (username + password) → access + refresh
- POST /api/token/refresh/  nouvel access (rotation + blacklist de l'ancien refresh)
- GET  /api/users/me/       profil de l'utilisateur connecté (Bearer token)

Permissions par défaut : IsAuthenticated.

Exemple (remplacer le mot de passe) :

    curl -X POST http://localhost:8000/api/token/ \
      -H "Content-Type: application/json" \
      -d '{"username":"davidlafranque","password":"votre-mot-de-passe"}'

    curl http://localhost:8000/api/users/me/ \
      -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"


5. Administrateur de développement
----------------------------------

Un compte admin peut exister en base locale (créé via createsuperuser).
Exemple de username souvent utilisé en dev : davidlafranque, rôle ADMIN.

Ne jamais committer de vrai mot de passe dans le dépôt.


6. Intégration continue
-----------------------

Fichier : .github/workflows/ci.yml

Jobs :
- Backend : check Django, migrations, tests (avec Postgres de service)
- Frontend : npm ci, lint, build
- Docker : docker compose build + smoke check backend


7. Développement hors Docker (optionnel)
----------------------------------------

Backend :

    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    # DATABASE_URL dans .env pointant vers Postgres accessible
    python manage.py migrate
    python manage.py runserver

Frontend :

    cd frontend
    npm install
    npm run dev

Le mode Docker reste le mode recommandé pour l'équipe.


8. Notes
--------

- Port Postgres hôte 5433 pour limiter les conflits avec un Postgres local.
- Port frontend 5175 pour éviter le conflit avec d'autres projets sur 5173.
- CORS autorise localhost:5175 et localhost:5173.
- Rotation des refresh tokens active ; app token_blacklist installée.
- Sprint suivant (Sprint 1) : US01, US02, US07 (inscription, auth complète, rôles / profils).
