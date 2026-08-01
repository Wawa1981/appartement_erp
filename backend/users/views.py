from rest_framework import generics, permissions
from rest_framework.response import Response
from .serializers import UserMeSerializer


class MeView(generics.RetrieveAPIView):
    """
    Endpoint protégé : retourne les informations de l'utilisateur connecté.
    Utilise le token JWT (Authorization: Bearer <token>).
    Exemple d'authentification JWT "de base" fonctionnelle.
    """
    serializer_class = UserMeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

