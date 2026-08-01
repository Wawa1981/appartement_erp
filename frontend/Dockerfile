# ===========================================
# Dockerfile - Frontend (Vite + React)
# Pour le développement avec hot-reload
# ===========================================

FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances d'abord (meilleur cache)
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code
COPY . .

# Exposer le port de Vite
EXPOSE 5173

# Commande par défaut (overridée dans docker-compose pour --host)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
