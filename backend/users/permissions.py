from rest_framework.permissions import BasePermission

from .models import UserRole


class IsAdminRole(BasePermission):
    """Accès réservé aux utilisateurs avec role ADMIN (ou superuser Django)."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        return getattr(user, "role", None) == UserRole.ADMIN
