from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AdminUserDetailView,
    AdminUserListView,
    AdminUserToggleActiveView,
    EmailTokenObtainPairView,
    GoogleAuthView,
    MeView,
    ChangePasswordView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
    ReservationDetailView,
    ReservationListCreateView,
)

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", EmailTokenObtainPairView.as_view(), name="auth-login"),
    path("auth/google/", GoogleAuthView.as_view(), name="auth-google"),
    path(
        "auth/password-reset/",
        PasswordResetRequestView.as_view(),
        name="auth-password-reset",
    ),
    path(
        "auth/password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="auth-password-reset-confirm",
    ),
    path("auth/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    # compat Sprint 0
    path("token/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("users/me/", MeView.as_view(), name="user-me"),
    path(
        "users/me/password/",
        ChangePasswordView.as_view(),
        name="user-me-password",
    ),
    path("reservations/", ReservationListCreateView.as_view(), name="reservation-list"),
    path(
        "reservations/<int:pk>/",
        ReservationDetailView.as_view(),
        name="reservation-detail",
    ),
    path("users/", AdminUserListView.as_view(), name="admin-user-list"),
    path("users/<int:pk>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
    path(
        "users/<int:pk>/toggle-active/",
        AdminUserToggleActiveView.as_view(),
        name="admin-user-toggle",
    ),
]
