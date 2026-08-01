from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserRole

User = get_user_model()


class UserModelTest(TestCase):
    def test_create_user_with_role(self):
        user = User.objects.create_user(
            username="pro1",
            email="pro@example.com",
            password="pass123",
            role=UserRole.PROFESSIONNEL,
        )
        self.assertEqual(user.role, UserRole.PROFESSIONNEL)
        self.assertFalse(user.is_admin)


class MeEndpointTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testpro",
            email="testpro@example.com",
            password="testpass123",
            role=UserRole.PROFESSIONNEL,
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_me_endpoint_returns_user(self):
        response = self.client.get("/api/users/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "testpro")
        self.assertEqual(response.data["role"], "PROFESSIONNEL")


