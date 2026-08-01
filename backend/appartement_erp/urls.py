from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from users.views import MeView

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT Authentication (base)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Exemple d'endpoint protégé (Sprint 0)
    path('api/users/me/', MeView.as_view(), name='user-me'),
]