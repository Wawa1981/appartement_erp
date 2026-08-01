from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Sérialiseur basique pour l'utilisateur (utilisé pour /me et plus tard)."""

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
        ]
        read_only_fields = ["id", "date_joined", "is_active"]


class UserMeSerializer(UserSerializer):
    """Version allégée pour l'endpoint /api/users/me/."""
    pass
