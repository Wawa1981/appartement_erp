# =============================================
# DOCKERFILE - Backend Django (Mode développement)
# =============================================

# On utilise Python 3.13 pour correspondre à l'environnement local
FROM python:3.13-slim

# Empêche Python de créer des fichiers .pyc et buffer
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup --no-create-home appuser

WORKDIR /app

# Installer les dépendances système (libpq + outils de build pour psycopg2-binary si nécessaire)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    libpq-dev \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copier les requirements en premier (optimisation du cache Docker)
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copier le code de l'application
COPY . .

# Donner les droits à l'utilisateur non-root
RUN chown -R appuser:appgroup /app

# Passer à l'utilisateur non-root
USER appuser

# Exposer le port Django
EXPOSE 8000

# Commande par défaut (overridée par docker-compose en dev)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

