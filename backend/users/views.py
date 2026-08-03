from django.conf import settings
from django.utils.translation import gettext as _
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.db.models import Q
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .permissions import IsAdminRole
from .serializers import (
    AdminUserUpdateSerializer,
    EmailTokenObtainPairSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    ReservationSerializer,
    UserMeSerializer,
    UserSerializer,
)
from .models import Reservation, UserRole

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
                "message": _("Compte créé avec succès."),
                "user": UserMeSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class EmailTokenObtainPairView(TokenObtainPairView):
    """US02 — Connexion par email + JWT."""

    serializer_class = EmailTokenObtainPairSerializer


class PasswordResetRequestView(APIView):
    """Demande de réinitialisation (email). Toujours 200 pour ne pas fuiter les comptes."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = PasswordResetRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        email = ser.validated_data["email"].strip().lower()

        payload = {
            "message": (
                _("Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.")
            )
        }

        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user is None or not user.has_usable_password():
            # Compte Google-only ou inexistant : même réponse
            return Response(payload)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        frontend = getattr(settings, "FRONTEND_URL", "http://localhost:5175").rstrip(
            "/"
        )
        reset_url = f"{frontend}/reinitialiser-mot-de-passe?uid={uid}&token={token}"

        subject = _("Réinitialisation de votre mot de passe — L'Appartement")
        body = (
            f"Bonjour{(' ' + user.first_name) if user.first_name else ''},\n\n"
            "Vous avez demandé la réinitialisation de votre mot de passe.\n"
            "Cliquez sur le lien ci-dessous (valide quelques heures) :\n\n"
            f"{reset_url}\n\n"
            "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.\n\n"
            "— L'équipe L'Appartement"
        )
        try:
            send_mail(
                subject,
                body,
                getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@appartement.local"),
                [user.email],
                fail_silently=False,
            )
        except Exception:
            # En dev console backend ça passe ; en prod log silencieux côté client
            if settings.DEBUG:
                return Response(
                    {
                        **payload,
                        "detail": _("Envoi email en échec (voir logs serveur)."),
                        "debug_reset_url": reset_url,
                    },
                    status=status.HTTP_200_OK,
                )
            return Response(payload)

        if settings.DEBUG:
            # Pratique en local sans boîte mail
            payload["debug_reset_url"] = reset_url

        return Response(payload)


class PasswordResetConfirmView(APIView):
    """Confirme le reset avec uid + token + nouveau mot de passe."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = PasswordResetConfirmSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        uid = ser.validated_data["uid"]
        token = ser.validated_data["token"]
        password = ser.validated_data["password"]

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"detail": _("Lien de réinitialisation invalide.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {"detail": _("Lien expiré ou déjà utilisé. Refaites une demande.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(password)
        user.save(update_fields=["password"])
        return Response({"message": _("Mot de passe mis à jour. Vous pouvez vous connecter.")})


class GoogleAuthView(APIView):
    """
    Connexion / inscription via Google.
    Body JSON :
      - credential ou id_token : JWT Google Identity Services
      - ou access_token : token OAuth (userinfo)
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        client_id = getattr(settings, "GOOGLE_CLIENT_ID", "") or ""
        if not client_id:
            return Response(
                {
                    "detail": (
                        "Google OAuth non configuré. "
                        "Définir GOOGLE_CLIENT_ID dans l'environnement."
                    )
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        id_token_str = (
            request.data.get("credential")
            or request.data.get("id_token")
            or ""
        ).strip()
        access_token = (request.data.get("access_token") or "").strip()

        email = ""
        first_name = ""
        last_name = ""

        try:
            if id_token_str:
                from google.auth.transport import requests as google_requests
                from google.oauth2 import id_token as google_id_token

                idinfo = google_id_token.verify_oauth2_token(
                    id_token_str,
                    google_requests.Request(),
                    client_id,
                )
                if idinfo.get("iss") not in (
                    "accounts.google.com",
                    "https://accounts.google.com",
                ):
                    return Response(
                        {"detail": _("Émetteur du token Google invalide.")},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                email = (idinfo.get("email") or "").strip().lower()
                first_name = idinfo.get("given_name") or ""
                last_name = idinfo.get("family_name") or ""
                if not idinfo.get("email_verified", True):
                    return Response(
                        {"detail": _("Email Google non vérifié.")},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            elif access_token:
                import requests as http_requests

                r = http_requests.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"},
                    timeout=10,
                )
                if r.status_code != 200:
                    return Response(
                        {"detail": _("Token Google invalide ou expiré.")},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                info = r.json()
                email = (info.get("email") or "").strip().lower()
                first_name = info.get("given_name") or ""
                last_name = info.get("family_name") or ""
                if info.get("email_verified") is False:
                    return Response(
                        {"detail": _("Email Google non vérifié.")},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            else:
                return Response(
                    {
                        "detail": (
                            _("Fournir credential/id_token ou access_token Google.")
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except ValueError:
            return Response(
                {"detail": _("Token Google invalide.")},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception:
            return Response(
                {"detail": _("Impossible de valider le compte Google.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not email:
            return Response(
                {"detail": _("Impossible de récupérer l'email Google.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            base = email.split("@")[0][:40] or "user"
            username = base
            i = 1
            while User.objects.filter(username=username).exists():
                username = f"{base}{i}"
                i += 1
            user = User(
                username=username,
                email=email,
                first_name=first_name or "",
                last_name=last_name or "",
                role=UserRole.PROFESSIONNEL,
            )
            user.set_unusable_password()
            user.save()
        else:
            if not user.is_active:
                return Response(
                    {"detail": _("Ce compte est désactivé.")},
                    status=status.HTTP_403_FORBIDDEN,
                )
            # Complète prénom/nom s'ils manquent
            updated = []
            if not user.first_name and first_name:
                user.first_name = first_name
                updated.append("first_name")
            if not user.last_name and last_name:
                user.last_name = last_name
                updated.append("last_name")
            if updated:
                user.save(update_fields=updated)

        refresh = RefreshToken.for_user(user)
        refresh["role"] = user.role
        refresh["email"] = user.email

        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserMeSerializer(user).data,
            }
        )


class MeView(generics.RetrieveUpdateAPIView):
    """Profil connecté : GET + PATCH."""

    serializer_class = UserMeSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "put", "head", "options"]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """POST /users/me/password/ — current_password + password + password_confirm."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        current = request.data.get("current_password") or ""
        password = request.data.get("password") or ""
        confirm = request.data.get("password_confirm") or ""
        user = request.user
        if not user.check_password(current):
            return Response(
                {"detail": _("Mot de passe actuel incorrect.")},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if password != confirm:
            return Response(
                {"password_confirm": _("Les mots de passe ne correspondent pas.")},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            from django.contrib.auth.password_validation import validate_password

            validate_password(password, user)
        except Exception as e:
            return Response(
                {"password": list(getattr(e, "messages", [str(e)]))},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(password)
        user.save(update_fields=["password"])
        return Response({"message": _("Mot de passe mis à jour.")})


class ReservationListCreateView(generics.ListCreateAPIView):
    """
    GET : réservations de l'utilisateur (pro) ou toutes (admin).
    POST : créer une réservation pour soi.
    """

    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Reservation.objects.select_related("user").all()
        user = self.request.user
        if getattr(user, "role", None) != UserRole.ADMIN:
            qs = qs.filter(user=user)
        statut = self.request.query_params.get("statut", "").strip()
        if statut:
            qs = qs.filter(statut=statut)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReservationDetailView(generics.RetrieveUpdateAPIView):
    """Détail / annulation (statut) — propriétaire ou admin."""

    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "put", "head", "options"]

    def get_queryset(self):
        qs = Reservation.objects.select_related("user").all()
        user = self.request.user
        if getattr(user, "role", None) != UserRole.ADMIN:
            qs = qs.filter(user=user)
        return qs


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
            return Response({"detail": _("Utilisateur introuvable.")}, status=404)

        if user.pk == request.user.pk:
            return Response(
                {"detail": _("Vous ne pouvez pas désactiver votre propre compte.")},
                status=400,
            )

        user.is_active = not user.is_active
        user.save(update_fields=["is_active"])
        return Response(UserSerializer(user).data)
