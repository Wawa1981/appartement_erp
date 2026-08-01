from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserRole

User = get_user_model()


class UserModelTest(TestCase):
    def test_create_user_with_role(self):
        user = User.objects.create_user(
            username="pro1",
            email="pro@example.com",
            password="pass12345",
            role=UserRole.PROFESSIONNEL,
        )
        self.assertEqual(user.role, UserRole.PROFESSIONNEL)
        self.assertFalse(user.is_admin)


class RegisterLoginTest(APITestCase):
    def test_register_creates_professionnel(self):
        res = self.client.post(
            "/api/auth/register/",
            {
                "email": "newpro@example.com",
                "password": "SecurePass123!",
                "password_confirm": "SecurePass123!",
                "first_name": "Ada",
                "last_name": "Lovelace",
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="newpro@example.com")
        self.assertEqual(user.role, UserRole.PROFESSIONNEL)

    def test_login_with_email(self):
        User.objects.create_user(
            username="testpro",
            email="testpro@example.com",
            password="testpass123",
            role=UserRole.PROFESSIONNEL,
        )
        res = self.client.post(
            "/api/auth/login/",
            {"email": "testpro@example.com", "password": "testpass123"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)


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

    def test_me_patch_name(self):
        response = self.client.patch(
            "/api/users/me/",
            {"first_name": "Jean"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Jean")


class AdminUsersTest(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin1",
            email="admin@example.com",
            password="adminpass123",
            role=UserRole.ADMIN,
        )
        self.pro = User.objects.create_user(
            username="pro2",
            email="pro2@example.com",
            password="propass123",
            role=UserRole.PROFESSIONNEL,
        )
        refresh = RefreshToken.for_user(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_list_users_as_admin(self):
        res = self.client.get("/api/users/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # DRF may paginate or not
        data = res.data if isinstance(res.data, list) else res.data.get("results", res.data)
        self.assertTrue(len(data) >= 2)

    def test_pro_cannot_list_users(self):
        refresh = RefreshToken.for_user(self.pro)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        res = self.client.get("/api/users/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_toggle_active(self):
        res = self.client.post(f"/api/users/{self.pro.pk}/toggle-active/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.pro.refresh_from_db()
        self.assertFalse(self.pro.is_active)
