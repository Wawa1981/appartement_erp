from django.contrib.auth import get_user_model
from django.utils.translation import gettext as _
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Reservation, UserRole

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "is_active",
            "date_joined",
            "phone",
        ]
        read_only_fields = ["id", "date_joined"]


class UserMeSerializer(serializers.ModelSerializer):
    """Profil connecté — lecture / PATCH (champs métier)."""

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "is_active",
            "date_joined",
            "phone",
            "bio",
            "specialties",
            "notify_reminder",
            "notify_payment",
            "notify_slots",
            "notify_newsletter",
        ]
        read_only_fields = ["id", "username", "role", "is_active", "date_joined"]


class ReservationSerializer(serializers.ModelSerializer):
    """Réservation API."""

    client_name = serializers.SerializerMethodField()
    client_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Reservation
        fields = [
            "id",
            "user",
            "client_name",
            "client_email",
            "espace",
            "poste",
            "poste_id",
            "type_poste",
            "date",
            "start_time",
            "end_time",
            "montant",
            "statut",
            "address",
            "service_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at", "client_name", "client_email"]

    def get_client_name(self, obj):
        return obj.user.get_full_name() or obj.user.email

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
        ]

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(_("Un compte existe déjà avec cet email."))
        return email

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": _("Les mots de passe ne correspondent pas.")}
            )
        validate_password(attrs["password"])
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        email = validated_data["email"]
        # username dérivé de l'email (unique Django)
        base = email.split("@")[0][:40] or "user"
        username = base
        i = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}{i}"
            i += 1
        user = User(
            username=username,
            email=email,
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            role=UserRole.PROFESSIONNEL,
        )
        user.set_password(password)
        user.save()
        return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Login par email + mot de passe (USERNAME_FIELD reste username en base)."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["email"] = serializers.EmailField(write_only=True)
        self.fields["password"] = serializers.CharField(write_only=True)
        # On n'utilise pas le champ username généré par SimpleJWT
        if "username" in self.fields:
            del self.fields["username"]

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["email"] = user.email
        return token

    def validate(self, attrs):
        email = (attrs.get("email") or "").strip().lower()
        password = attrs.get("password") or ""

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                _("Email ou mot de passe incorrect."),
            )

        if not user.is_active:
            raise serializers.ValidationError(_("Ce compte est désactivé."))

        if not user.check_password(password):
            raise serializers.ValidationError(
                _("Email ou mot de passe incorrect."),
            )

        refresh = self.get_token(user)
        data = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserMeSerializer(user).data,
        }
        return data


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["role", "is_active", "first_name", "last_name", "email"]

    def validate_role(self, value):
        if value not in UserRole.values:
            raise serializers.ValidationError(_("Rôle invalide."))
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": _("Les mots de passe ne correspondent pas.")}
            )
        validate_password(attrs["password"])
        return attrs
