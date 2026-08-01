"""
Django settings for appartement_erp project.
"""

from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv
import dj_database_url

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# =============================================
# SÉCURITÉ
# =============================================
SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("SECRET_KEY est manquant dans le fichier .env")

DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 'yes')

# ALLOWED_HOSTS configurable via variable d'environnement.
# En Docker on ajoute souvent "backend" (nom du service) et "host.docker.internal".
ALLOWED_HOSTS_ENV = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,backend,host.docker.internal')
ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS_ENV.split(',') if host.strip()]

# En mode DEBUG, on peut aussi autoriser tout (pratique en dev local/Docker)
if DEBUG:
    # On garde la liste ci-dessus + on peut ajouter '*' si besoin
    # Mais on reste restrictif par défaut
    pass


# =============================================
# APPLICATIONS
# =============================================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',  # requis si BLACKLIST_AFTER_ROTATION=True
    'corsheaders',

    # Local apps
    'users',
]

# =============================================
# MODÈLE UTILISATEUR PERSONNALISÉ (Sprint 0)
# =============================================
AUTH_USER_MODEL = 'users.User'



# =============================================
# MIDDLEWARE
# =============================================
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


ROOT_URLCONF = 'appartement_erp.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'appartement_erp.wsgi.application'


# =============================================
# BASE DE DONNÉES
# =============================================
# En mode "tout Docker", DATABASE_URL est injectée par docker-compose
# et pointe vers le service "db" (ex: postgres://...@db:5432/...)
# En local hors Docker, on peut définir DATABASE_URL dans .env
# pour pointer vers localhost:5432 (mais ce n'est plus le mode recommandé).
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL')
    )
}


# =============================================
# VALIDATION DES MOTS DE PASSE
# =============================================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# =============================================
# INTERNATIONALISATION
# =============================================
LANGUAGE_CODE = 'fr'
TIME_ZONE = 'Europe/Paris'

LANGUAGES = [
    ('fr', 'Français'),
    ('en', 'English'),
]

USE_I18N = True
USE_TZ = True


# =============================================
# FICHIERS STATIQUES
# =============================================
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# =============================================
# REST FRAMEWORK + JWT
# =============================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}


# =============================================
# CORS
# =============================================
# Ports front : 5175 en Docker (compose), 5173 possible hors Docker
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://frontend:5175",
    "http://frontend:5173",
]

if DEBUG:
    # On peut décommenter pour du dev très permissif si besoin :
    # CORS_ALLOW_ALL_ORIGINS = True
    pass

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ["DELETE", "GET", "OPTIONS", "PATCH", "POST", "PUT"]
CORS_ALLOW_HEADERS = ["*"]