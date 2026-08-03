# L'Appartement ERP

Application ERP pour L'Appartement 137 et L'Appartement 80 (coworking beauté).

- Backend : Django 6 + Django REST Framework + SimpleJWT
- Frontend : React 19 + Vite + Tailwind CSS v4
- Base de données : PostgreSQL 16
- Environnement : Docker (recommandé)

---

# SPRINT 0

## 1. Création du dossier principal et Git

```bash
mkdir -p /var/www/appartement_erp
cd /var/www/appartement_erp
```

Crée le répertoire racine du projet et s’y place.

```bash
git init
```

Initialise un dépôt Git local (dossier `.git/`).

```bash
git branch -M master
```

Nomme la branche principale `master`.

```bash
# plus tard, après les premiers fichiers :
# git remote add origin git@github.com:Wawa1981/appartement_erp.git
# git add .
# git commit -m "Initial commit: Sprint 0 infrastructure"
# git push -u origin master
```

Lie le dépôt distant GitHub, crée le premier commit, pousse le Sprint 0.

---

## 2. Backend — Django (environnement local)

### Création du projet Django

```bash
mkdir -p backend
cd backend
```

Crée le dossier backend dans le projet.

```bash
python3 -m venv venv
```

Crée un environnement virtuel Python isolé (`venv/`).

```bash
source venv/bin/activate
```

Active le venv (le prompt affiche `(venv)`).

```bash
pip install --upgrade pip
```

Met pip à jour dans le venv.

```bash
pip install django djangorestframework djangorestframework-simplejwt python-dotenv dj-database-url psycopg2-binary django-cors-headers
```

Installe Django, DRF, JWT, dotenv, driver Postgres, CORS.

```bash
pip freeze > requirements.txt
```

Génère `backend/requirements.txt` avec les versions installées (reproductible pour Docker et l’équipe).

Contenu type Sprint 0 (`backend/requirements.txt`) :

```text
asgiref==3.11.1
dj-database-url==3.1.2
Django==6.0.7
django-cors-headers==4.9.0
djangorestframework==3.17.1
djangorestframework_simplejwt==5.5.1
PyJWT==2.13.0
python-dotenv==1.2.2
sqlparse==0.5.5
psycopg2-binary==2.9.12
```

Réinstallation depuis le fichier :

```bash
pip install -r requirements.txt
```

Réinstalle toutes les deps listées dans `requirements.txt` (venv local ou build Docker).

```bash
django-admin startproject appartement_erp .
```

Génère le projet Django dans `backend/` (settings, urls, manage.py, wsgi, asgi).

```bash
python manage.py startapp users
```

Crée l’application `users/` (models, views, admin, apps, etc.).

### Base de données et migrations

```bash
python manage.py makemigrations
```

Génère les fichiers de migration à partir des modèles.

```bash
python manage.py migrate
```

Applique les migrations (tables auth, users, admin, sessions, token_blacklist plus tard).

```bash
python manage.py createsuperuser
```

Crée un compte superutilisateur pour `/admin`.

```bash
python manage.py runserver
```

Lance le serveur de dev Django sur http://127.0.0.1:8000/

### Utilisateur custom

- Modèle `users.User` (AUTH_USER_MODEL)
- Hérite de AbstractUser
- email unique
- champ role : ADMIN, PROFESSIONNEL
- Mis en place dès le Sprint 0 pour ne pas changer AUTH_USER_MODEL plus tard

```bash
python manage.py makemigrations users
python manage.py migrate
```

Crée et applique la migration du modèle User custom.

### Authentification JWT (Sprint 0)

```text
POST /api/token/
POST /api/token/refresh/
GET  /api/users/me/
```

```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "davidlafranque",
    "password": "votre-mot-de-passe"
  }'
```

Retourne les tokens JWT `access` et `refresh`.

```bash
curl http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer <access_token>"
```

Retourne le profil de l’utilisateur connecté (endpoint protégé).

### Superutilisateur de développement

```bash
python manage.py createsuperuser
```

- Username exemple : davidlafranque
- Rôle : ADMIN

### Internationalisation i18n (config Django)

Dans `backend/appartement_erp/settings.py` :

```python
LANGUAGE_CODE = 'fr'
TIME_ZONE = 'Europe/Paris'

LANGUAGES = [
    ('fr', 'Français'),
    ('en', 'English'),
]

USE_I18N = True
USE_TZ = True
```

Définit le français par défaut, l’anglais comme seconde langue, active i18n et le fuseau Paris.

Middleware :

```python
'django.middleware.locale.LocaleMiddleware',
```

Active la détection de langue (session / Accept-Language) côté Django.

Admin Django et messages framework utilisent ces réglages (FR par défaut, EN disponible).

---

## 3. Dockerisation

### Fichiers créés

- docker-compose.yml (PostgreSQL + Django backend + Frontend)
- backend/Dockerfile
- frontend/Dockerfile
- .env
- .env.example
- .dockerignore
- .gitignore

### Configuration .env

```bash
cd /var/www/appartement_erp
cp .env.example .env
```

Copie le modèle d’environnement vers `.env` (non versionné).

```env
POSTGRES_DB=appartement_erp
POSTGRES_USER=erp_user
POSTGRES_PASSWORD=change-me-in-production
SECRET_KEY=change-this-to-a-strong-random-secret-key
DEBUG=True
POSTGRES_HOST_PORT=5433
BACKEND_HOST_PORT=8000
FRONTEND_HOST_PORT=5175
```

### Commandes Docker

```bash
docker compose up --build
```

Build les images et démarre db + backend + frontend au premier plan (logs visibles).

```bash
docker compose up --build -d
```

Même chose en arrière-plan (detached).

```bash
docker compose ps
```

Liste l’état des conteneurs (Up, ports, health).

```bash
docker compose logs -f backend
```

Suit les logs Django en direct.

```bash
docker compose logs -f frontend
```

Suit les logs Vite en direct.

```bash
docker compose exec backend python manage.py migrate
```

Exécute les migrations dans le conteneur backend.

```bash
docker compose exec backend python manage.py createsuperuser
```

Crée un superuser dans la base Docker.

```bash
docker compose exec backend python manage.py test
```

Lance les tests Django dans le conteneur.

```bash
docker compose down
```

Arrête et supprime les conteneurs (volumes conservés).

```bash
docker compose down -v
```

Arrête les conteneurs et supprime aussi les volumes (données Postgres effacées).

### Services

| Service  | Outil              | Port  |
|----------|--------------------|-------|
| db       | postgres:16-alpine | 5433  |
| backend  | Django + DRF       | 8000  |
| frontend | React + Vite       | 5175  |

```text
Frontend .............. http://localhost:5175
API Django ............ http://localhost:8000
Admin Django .......... http://localhost:8000/admin
PostgreSQL ............ localhost:5433
```

---

## 4. Frontend — React + Vite + Tailwind

### Initialisation

```bash
cd /var/www/appartement_erp
mkdir -p frontend
cd frontend
```

Crée le dossier frontend.

```bash
npm create vite@latest . -- --template react
```

Scaffold le projet React + Vite (package.json, src/, index.html, vite.config).

```bash
npm install
```

Installe les dépendances npm (node_modules).

### Tailwind CSS

```bash
npm install tailwindcss @tailwindcss/vite
```

Ajoute Tailwind v4 et le plugin Vite.

vite.config.js : plugins react + tailwindcss  
src/index.css :

```css
@import "tailwindcss";
```

Active Tailwind dans les styles globaux.

### Lancement

```bash
npm run dev
```

Démarre le serveur de dev Vite (hot-reload).

### Avec Docker

```bash
docker compose up --build -d frontend
```

Rebuild et démarre uniquement le service frontend.

```bash
docker compose logs -f frontend
```

Affiche les logs Vite du conteneur.

---

## 5. Intégration continue

Fichier créé : `.github/workflows/ci.yml`

Jobs :
- Backend : check Django, migrations, tests (Postgres de service)
- Frontend : npm ci, lint, build
- Docker : docker compose build + smoke check backend

Se déclenche sur push / PR GitHub.

---

## 6. Structure du projet après Sprint 0

```text
appartement_erp/
├── .git/
├── backend/
│   ├── appartement_erp/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── users/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── admin.py
│   │   └── tests.py
│   ├── Dockerfile
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── vite.config.js
│   └── package.json
├── .github/workflows/ci.yml
├── docker-compose.yml
├── .env
├── .env.example
├── .gitignore
└── README.md
```

---

## 7. Démarrage complet Sprint 0

```bash
cd /var/www/appartement_erp
cp .env.example .env
```

Prépare la configuration locale.

```bash
docker compose up --build -d
```

Monte toute la stack.

```bash
docker compose exec backend python manage.py migrate
```

Applique le schéma BDD.

```bash
docker compose exec backend python manage.py createsuperuser
```

Crée l’admin Django.

```text
http://localhost:5175
http://localhost:8000
http://localhost:8000/admin
```

---

## 8. Notes Sprint 0

- Port Postgres hôte 5433
- Port frontend 5175
- CORS localhost:5175 et localhost:5173
- Rotation des refresh tokens + token_blacklist
- AUTH_USER_MODEL fixé dès Sprint 0
- i18n Django : LANGUAGE_CODE=fr, LANGUAGES fr+en, LocaleMiddleware, USE_I18N

```bash
git add .
git commit -m "Initial commit: Sprint 0 infrastructure"
git push -u origin master
```

Commit et push du Sprint 0 sur GitHub.

---

# SPRINT 1

## 9. Backend — inscription (US01)

```text
POST /api/auth/register/
```

Fichiers : RegisterSerializer, RegisterView, urls

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pro@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "first_name": "Ada",
    "last_name": "Lovelace"
  }'
```

Crée un compte role PROFESSIONNEL et renvoie 201 + user.

---

## 10. Backend — login email JWT (US02)

```text
POST /api/auth/login/
```

Fichier : EmailTokenObtainPairSerializer / EmailTokenObtainPairView

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pro@example.com",
    "password": "SecurePass123!"
  }'
```

Retourne access, refresh et l’objet user (login par email).

```text
POST /api/auth/refresh/
```

```bash
curl -X POST http://localhost:8000/api/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh":"REFRESH_TOKEN"}'
```

Émet un nouvel access (rotation + blacklist de l’ancien refresh).

Compat Sprint 0 conservée :

```text
POST /api/token/
POST /api/token/refresh/
```

---

## 11. Backend — profil connecté

```text
GET  /api/users/me/
PATCH /api/users/me/
```

```bash
curl http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

Lit le profil JWT.

```bash
curl -X PATCH http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Jean","last_name":"Dupont"}'
```

Met à jour prénom / nom / email du compte connecté.

---

## 12. Backend — admin utilisateurs (US07)

```text
GET  /api/users/
GET  /api/users/<id>/
PATCH /api/users/<id>/
POST /api/users/<id>/toggle-active/
```

JWT + role ADMIN. Fichiers : IsAdminRole, AdminUserListView, AdminUserDetailView, AdminUserToggleActiveView

```bash
curl http://localhost:8000/api/users/ \
  -H "Authorization: Bearer ACCESS_ADMIN"
```

Liste tous les utilisateurs.

```bash
curl "http://localhost:8000/api/users/?search=ada&role=PROFESSIONNEL" \
  -H "Authorization: Bearer ACCESS_ADMIN"
```

Filtre par recherche et rôle.

```bash
curl http://localhost:8000/api/users/1/ \
  -H "Authorization: Bearer ACCESS_ADMIN"
```

Détail d’un utilisateur.

```bash
curl -X PATCH http://localhost:8000/api/users/1/ \
  -H "Authorization: Bearer ACCESS_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"role":"ADMIN","is_active":true}'
```

Modifie rôle / statut / identité.

```bash
curl -X POST http://localhost:8000/api/users/1/toggle-active/ \
  -H "Authorization: Bearer ACCESS_ADMIN"
```

Active ou désactive le compte.

---

## 13. Backend — tests

```bash
docker compose exec backend python manage.py test
```

Lance toute la suite de tests Django.

```bash
docker compose exec backend python manage.py test users
```

Lance uniquement les tests de l’app users (register, login email, me, admin — 8 tests).

---

## 14. Frontend — landing

```bash
cd frontend
npm install react-router-dom lucide-react
```

Ajoute le routeur et les icônes.

Fichiers :
- frontend/src/pages/Landing.jsx
- frontend/src/App.jsx
- frontend/src/main.jsx (BrowserRouter)

```text
http://localhost:5175/
```

Page d’accueil L’Appartement (espaces, témoignages, liens connexion / inscription).

---

## 15. Frontend — visite photos / 3D

```bash
cd frontend
npm install three
```

Ajoute three.js pour le viewer immersif.

Fichiers :
- frontend/src/components/ImmersiveViewer.jsx
- frontend/src/components/DpadBtn.jsx
- frontend/public/espaces/le137/
- frontend/public/espaces/le80/

Produit une galerie photo + mode 3D (déplacement WASD / D-pad) sur les photos des espaces.

---

## 16. Frontend — connexion

Fichiers :
- frontend/src/pages/Login.jsx
- frontend/src/components/AuthLayout.jsx
- frontend/src/api/client.js

```text
http://localhost:5175/connexion
```

Formulaire email / mot de passe branché sur `POST /api/auth/login/`.

localStorage après login :
- appartement_access
- appartement_refresh
- appartement_user

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"pro@example.com","password":"SecurePass123!"}'
```

Vérifie l’API de login côté backend.

---

## 17. Frontend — inscription

Fichier : frontend/src/pages/Register.jsx

```text
http://localhost:5175/inscription
```

Formulaire d’inscription pro → `POST /api/auth/register/` puis login auto et redirection `/`.

---

## 18. Google OAuth

```bash
cd backend
source venv/bin/activate
pip install google-auth==2.40.3 requests==2.32.4
pip freeze > requirements.txt
```

Ajoute google-auth et requests, met à jour `requirements.txt`.

`requirements.txt` après Sprint 1 (fichier actuel) :

```text
asgiref==3.11.1
dj-database-url==3.1.2
Django==6.0.7
django-cors-headers==4.9.0
djangorestframework==3.17.1
djangorestframework_simplejwt==5.5.1
PyJWT==2.13.0
python-dotenv==1.2.2
sqlparse==0.5.5
psycopg2-binary==2.9.12
google-auth==2.40.3
requests==2.32.4
```

```bash
docker compose build backend
docker compose up -d backend
```

Rebuild l’image backend (Dockerfile : `pip install -r requirements.txt`) et redémarre le service.

```text
POST /api/auth/google/
```

```bash
curl -X POST http://localhost:8000/api/auth/google/ \
  -H "Content-Type: application/json" \
  -d '{"access_token":"GOOGLE_ACCESS_TOKEN"}'
```

Valide le token Google, crée ou retrouve l’user, renvoie JWT.

.env (à compléter) :

```env
GOOGLE_CLIENT_ID=
VITE_GOOGLE_CLIENT_ID=
FRONTEND_URL=http://localhost:5175
VITE_API_URL=http://localhost:8000/api
```

```bash
docker compose up -d
```

Recharge backend et frontend avec les variables Google / API.

Fichiers :
- backend/users/views.py (GoogleAuthView)
- frontend/src/components/GoogleIcon.jsx
- boutons Google sur Login et Register

---

## 19. Mot de passe oublié

```text
POST /api/auth/password-reset/
POST /api/auth/password-reset/confirm/
```

```bash
curl -X POST http://localhost:8000/api/auth/password-reset/ \
  -H "Content-Type: application/json" \
  -d '{"email":"pro@example.com"}'
```

Envoie (ou log en DEBUG) un lien de reset ; ne révèle pas si l’email existe.

```bash
docker compose logs -f backend
```

En DEBUG, le mail apparaît dans les logs console Django.

```bash
curl -X POST http://localhost:8000/api/auth/password-reset/confirm/ \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "UID",
    "token": "TOKEN",
    "password": "NewPass123!",
    "password_confirm": "NewPass123!"
  }'
```

Enregistre le nouveau mot de passe si uid/token valides.

Pages :
```text
http://localhost:5175/mot-de-passe-oublie
http://localhost:5175/forgot-password
http://localhost:5175/reinitialiser-mot-de-passe?uid=...&token=...
```

Fichiers :
- ForgotPassword.jsx
- ResetPassword.jsx
- PasswordResetRequestView, PasswordResetConfirmView

---

## 20. i18n FR / EN (complète le Sprint 0)

Config Django déjà en place au Sprint 0 (LANGUAGE_CODE, LANGUAGES, LocaleMiddleware).  
Sprint 1 : i18n produit front + catalogues de traduction API.

```bash
cd frontend
npm install i18next react-i18next i18next-browser-languagedetector
```

Ajoute la stack i18n front.

Fichiers :
- frontend/src/i18n/index.js
- frontend/src/i18n/locales/fr.json
- frontend/src/i18n/locales/en.json
- frontend/src/components/LanguageSwitcher.jsx

Switcher FR | EN dans le header et les pages auth.  
localStorage : `appartement_lang`  
client API envoie `Accept-Language`.

Backend (catalogues messages) :
- LOCALE_PATHS = backend/locale/
- backend/locale/en/LC_MESSAGES/django.po + django.mo
- messages API passés en gettext

```bash
curl -X POST http://localhost:8000/api/auth/password-reset/ \
  -H "Content-Type: application/json" \
  -H "Accept-Language: en" \
  -d '{"email":"nobody@example.com"}'
```

Message API en anglais.

```bash
curl -X POST http://localhost:8000/api/auth/password-reset/ \
  -H "Content-Type: application/json" \
  -H "Accept-Language: fr" \
  -d '{"email":"nobody@example.com"}'
```

Message API en français.

---

## 21. Structure du projet après Sprint 1

```text
appartement_erp/
├── .git/
├── backend/
│   ├── appartement_erp/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── users/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   ├── admin.py
│   │   └── tests.py
│   ├── locale/en/LC_MESSAGES/
│   │   ├── django.po
│   │   └── django.mo
│   ├── Dockerfile
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/espaces/
│   ├── src/
│   │   ├── api/client.js
│   │   ├── i18n/
│   │   │   ├── index.js
│   │   │   └── locales/
│   │   │       ├── fr.json
│   │   │       └── en.json
│   │   ├── components/
│   │   │   ├── AuthLayout.jsx
│   │   │   ├── LanguageSwitcher.jsx
│   │   │   ├── GoogleIcon.jsx
│   │   │   ├── ImmersiveViewer.jsx
│   │   │   └── DpadBtn.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ResetPassword.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── vite.config.js
│   └── package.json
├── .github/workflows/ci.yml
├── docker-compose.yml
├── .env.example
├── .gitignore
├── ScriptpostgreSQL
└── README.md
```

---

## 22. Commandes Docker récapitulatives

```bash
cd /var/www/appartement_erp
```

Se place à la racine du projet.

```bash
cp .env.example .env
```

Recrée la config locale si besoin.

```bash
docker compose up --build -d
```

Rebuild et démarre toute la stack.

```bash
docker compose ps
```

Contrôle que db, backend, frontend sont Up.

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

Debug live.

```bash
docker compose exec backend python manage.py migrate
```

Migrations.

```bash
docker compose exec backend python manage.py createsuperuser
```

Admin Django.

```bash
docker compose exec backend python manage.py test users
```

Tests Sprint 1 users.

```bash
docker compose exec db psql -U erp_user -d appartement_erp
```

Ouvre psql sur la base du projet.

```bash
docker compose down
```

Stop stack.

```bash
docker compose down -v
```

Stop stack + wipe volume Postgres.

---

## 23. PostgreSQL

```bash
docker compose exec db psql -U erp_user -d appartement_erp
```

Entre dans le client SQL du conteneur db.

```sql
\dt
```

Liste les tables.

```sql
SELECT COUNT(*) FROM users_user;
```

Compte les utilisateurs.

```sql
SELECT id, username, email, role, is_active, date_joined FROM users_user;
```

Liste id, email, rôle, statut.

```sql
\d users_user
```

Décrit la structure de la table users.

```sql
\q
```

Quitte psql.

Voir aussi ScriptpostgreSQL.

---

# État actuel — UI connectée & Home (après Sprint 1)

## Landing vs Home (ne pas confondre)

| Route | Page | Auth | Rôle |
|---|---|---|---|
| `/` | **Landing** publique (beige `#F5F0E8`) | Non | Vitrine visiteurs |
| `/home` | **Home** (design sombre, espaces, visite 3D) | **Oui** JWT | Accueil **connecté** (sidebar) |
| `/calendrier` | Calendrier pro | Oui | Dashboard pro |
| `/admin` ou `/dashboard` | Dashboard admin | Oui ADMIN | Dashboard admin |
| `/reserver` | Book-online / formules | Optionnel | Tarifs + résa |
| `/reservations` | Mes réservations | Oui | Pro |
| `/profil` | Mon profil | Oui | Pro / Admin |
| `/compte-pro` | Compte pro + documents | Oui PROFESSIONNEL | Pro |
| `/admin/gestion` | Administration | Oui ADMIN | Admin |
| `/mentions-legales`, `/cgu`, `/confidentialite` | Légal | Non | Public |

**Important :** l’onglet sidebar **Home** pointe vers `/home` (session conservée).  
Il ne doit **pas** renvoyer vers `/` (landing publique), sinon l’utilisateur a l’impression d’être déconnecté.

Dashboard reste **Dashboard** (`/calendrier` pro, `/admin` admin) — distinct de Home.

## Frontend — structure utile

```text
frontend/src/
├── pages/
│   ├── Landing.jsx          # publique /
│   ├── Home.jsx             # connecté /home
│   ├── BookOnline.jsx
│   ├── Calendar.jsx
│   ├── Dashboard.jsx
│   ├── Administration.jsx
│   ├── MesReservations.jsx
│   ├── MonProfil.jsx
│   ├── ComptePro.jsx
│   └── MentionsLegales.jsx / CGU.jsx / Confidentialite.jsx
├── components/
│   ├── AppShell.jsx         # sidebar pro / admin
│   ├── ImmersiveViewer.jsx  # visite photos / 3D
│   ├── Footer.jsx
│   └── RequireAuth.jsx
├── data/
│   ├── siteConfig.js        # CONTACT, LEGAL, SITE
│   ├── inventory.js         # postes 137 / 80
│   └── bookingCatalog.js    # formules & tarifs
├── api/
│   ├── client.js            # JWT, homePathForUser
│   ├── profile.js
│   └── reservations.js
└── i18n/locales/            # fr.json + en.json
```

## Identité légale (registre)

Société **L'APPARTEMENT** (SAS) — SIREN **949 833 537** — source societe.com / annuaire-entreprises.  
Données centralisées dans `frontend/src/data/siteConfig.js` (`LEGAL`).

## Lancer (Docker)

```bash
cd /var/www/appartement_erp
docker compose up -d
```

- Front : http://localhost:5175/
- API : http://localhost:8000/api/
- Admin Django : http://localhost:8000/admin/

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed_pros_site   # optionnel
```

## Seed pros (site)

```bash
docker compose exec backend python manage.py seed_pros_site
```

Crée / met à jour les comptes pro de démo (mdp documenté dans la commande).

## i18n

- Front : `react-i18next` — bascule FR/EN (landing + shell + pages app).
- Libellés UI via `fr.json` / `en.json` ; contacts / légal / tarifs numériques dans `data/`.

## Git

```bash
git status
git add -A   # hors .env (ignoré) et hors *.bak
git commit -m "..."
# push seulement si demandé explicitement
```

