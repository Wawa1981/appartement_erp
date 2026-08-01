from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .permissions import IsAdminRole
from .serializers import (
    AdminUserUpdateSerializer,
    EmailTokenObtainPairSerializer,
    RegisterSerializer,
    UserMeSerializer,
    UserSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """US01 — Inscription professionnel."""

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "message": "Compte créé avec succès.",
                "user": UserMeSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class EmailTokenObtainPairView(TokenObtainPairView):
    """US02 — Connexion par email + JWT."""

    serializer_class = EmailTokenObtainPairSerializer


class MeView(generics.RetrieveUpdateAPIView):
    """Profil connecté : GET + PATCH (prénom, nom, email)."""

    serializer_class = UserMeSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "put", "head", "options"]

    def get_object(self):
        return self.request.user


class AdminUserListView(generics.ListAPIView):
    """US07 — Liste des utilisateurs (admin)."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        qs = User.objects.all().order_by("-date_joined")
        search = self.request.query_params.get("search", "").strip()
        role = self.request.query_params.get("role", "").strip()
        if search:
            qs = qs.filter(
                Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(username__icontains=search)
            )
        if role:
            qs = qs.filter(role=role)
        return qs


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    """US07 — Détail / modification rôle & statut (admin)."""

    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    http_method_names = ["get", "patch", "put", "head", "options"]

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return AdminUserUpdateSerializer
        return UserSerializer


class AdminUserToggleActiveView(APIView):
    """US07 — Activer / désactiver un compte."""

    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "Utilisateur introuvable."}, status=404)

        if user.pk == request.user.pk:
            return Response(
                {"detail": "Vous ne pouvez pas désactiver votre propre compte."},
                status=400,
            )

        user.is_active = not user.is_active
        user.save(update_fields=["is_active"])
        return Response(UserSerializer(user).data)
