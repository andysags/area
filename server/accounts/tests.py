from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class AuthenticationTests(TestCase):
    """Tests for user authentication endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.register_url = '/auth/register/'
        self.login_url = '/auth/login/'
        self.profile_url = '/auth/me/'
        
        self.valid_user_data = {
            'email': 'test@example.com',
            'password': 'Test1234!',
            'first_name': 'Test',
            'last_name': 'User',
            'pseudo': 'testuser'
        }

    def test_user_registration_success(self):
        """Test successful user registration"""
        response = self.client.post(self.register_url, self.valid_user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['email'], 'test@example.com')
        self.assertTrue(User.objects.filter(email='test@example.com').exists())

    def test_user_registration_duplicate_email(self):
        """Test registration with existing email"""
        # Create first user
        self.client.post(self.register_url, self.valid_user_data, format='json')
        # Try to create second user with same email
        response = self.client.post(self.register_url, self.valid_user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_weak_password(self):
        """Test registration with weak password"""
        weak_data = self.valid_user_data.copy()
        weak_data['password'] = '123'
        response = self.client.post(self.register_url, weak_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_invalid_email(self):
        """Test registration with invalid email"""
        invalid_data = self.valid_user_data.copy()
        invalid_data['email'] = 'not-an-email'
        response = self.client.post(self.register_url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_success(self):
        """Test successful login"""
        # Register user first
        self.client.post(self.register_url, self.valid_user_data, format='json')
        # Login
        login_data = {
            'email': self.valid_user_data['email'],
            'password': self.valid_user_data['password']
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_user_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        login_data = {
            'email': 'wrong@example.com',
            'password': 'WrongPass123!'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_user_profile_authenticated(self):
        """Test getting user profile when authenticated"""
        # Register user
        self.client.post(self.register_url, self.valid_user_data, format='json')
        
        # Login to get token
        login_data = {
            'email': self.valid_user_data['email'],
            'password': self.valid_user_data['password']
        }
        login_response = self.client.post(self.login_url, login_data, format='json')
        token = login_response.data['access']
        
        # Get profile
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.valid_user_data['email'])

    def test_get_user_profile_unauthenticated(self):
        """Test getting user profile without authentication"""
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
