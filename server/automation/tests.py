from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Service, Action, Reaction, UserService
import uuid

User = get_user_model()


class ServiceAPITestCase(TestCase):
    """Test suite for Service API endpoints"""
    
    def setUp(self):
        """Set up test client and create test data"""
        self.client = APIClient()
        
        # Create test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        
        # Create test services
        self.timer_service = Service.objects.create(
            id=uuid.UUID('11111111-1111-1111-1111-111111111111'),
            name='timer',
            display_name='Timer',
            icon_url='https://example.com/timer.png'
        )
        
        self.github_service = Service.objects.create(
            id=uuid.UUID('33333333-3333-3333-3333-333333333333'),
            name='github',
            display_name='GitHub',
            icon_url='https://example.com/github.png'
        )
        
        # Create test actions
        self.timer_action = Action.objects.create(
            service=self.timer_service,
            name='every_minute',
            description='Triggers every minute'
        )
        
        self.github_action = Action.objects.create(
            service=self.github_service,
            name='new_commit',
            description='Triggers on new commit'
        )
        
        # Create test reactions
        self.timer_reaction = Reaction.objects.create(
            service=self.timer_service,
            name='delay',
            description='Wait for a duration'
        )
        
        self.github_reaction = Reaction.objects.create(
            service=self.github_service,
            name='create_issue',
            description='Create a new issue'
        )
    
    def test_list_services(self):
        """Test GET /services/ returns all services"""
        response = self.client.get('/services/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
        # Check service data
        service_names = [s['name'] for s in response.data]
        self.assertIn('timer', service_names)
        self.assertIn('github', service_names)
    
    def test_service_detail(self):
        """Test GET /services/<id>/ returns service with actions and reactions"""
        response = self.client.get(f'/services/{self.timer_service.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'timer')
        self.assertEqual(len(response.data['actions']), 1)
        self.assertEqual(len(response.data['reactions']), 1)
        self.assertEqual(response.data['actions'][0]['name'], 'every_minute')
    
    def test_service_actions(self):
        """Test GET /services/<id>/actions/ returns all actions for a service"""
        response = self.client.get(f'/services/{self.github_service.id}/actions/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'new_commit')
        self.assertEqual(response.data[0]['service_name'], 'github')
    
    def test_service_reactions(self):
        """Test GET /services/<id>/reactions/ returns all reactions for a service"""
        response = self.client.get(f'/services/{self.github_service.id}/reactions/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'create_issue')
    
    def test_subscribe_to_service_unauthenticated(self):
        """Test POST /services/<id>/subscribe/ requires authentication"""
        response = self.client.post(
            f'/services/{self.timer_service.id}/subscribe/',
            {'access_token': 'test_token'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_subscribe_to_service(self):
        """Test POST /services/<id>/subscribe/ creates subscription"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post(
            f'/services/{self.timer_service.id}/subscribe/',
            {
                'access_token': 'test_access_token',
                'refresh_token': 'test_refresh_token'
            }
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['service_name'], 'timer')
        
        # Verify subscription was created
        subscription = UserService.objects.get(user=self.user, service=self.timer_service)
        self.assertIsNotNone(subscription)
        
        # Verify tokens are encrypted
        self.assertNotEqual(subscription.access_token_enc, 'test_access_token')
        self.assertEqual(subscription.get_access_token(), 'test_access_token')
        self.assertEqual(subscription.get_refresh_token(), 'test_refresh_token')
    
    def test_subscribe_updates_existing(self):
        """Test POST /services/<id>/subscribe/ updates existing subscription"""
        self.client.force_authenticate(user=self.user)
        
        # Create initial subscription
        UserService.objects.create(
            user=self.user,
            service=self.timer_service
        )
        
        # Update subscription
        response = self.client.post(
            f'/services/{self.timer_service.id}/subscribe/',
            {'access_token': 'new_token'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify only one subscription exists
        count = UserService.objects.filter(user=self.user, service=self.timer_service).count()
        self.assertEqual(count, 1)
    
    def test_unsubscribe_from_service(self):
        """Test DELETE /services/<id>/unsubscribe/ removes subscription"""
        self.client.force_authenticate(user=self.user)
        
        # Create subscription
        subscription = UserService.objects.create(
            user=self.user,
            service=self.timer_service
        )
        
        # Unsubscribe
        response = self.client.delete(f'/services/{self.timer_service.id}/unsubscribe/')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify subscription was deleted
        exists = UserService.objects.filter(id=subscription.id).exists()
        self.assertFalse(exists)
    
    def test_unsubscribe_not_subscribed(self):
        """Test DELETE /services/<id>/unsubscribe/ returns 404 if not subscribed"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.delete(f'/services/{self.timer_service.id}/unsubscribe/')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error']['code'], 'NOT_SUBSCRIBED')
    
    def test_user_subscriptions(self):
        """Test GET /services/subscriptions/ returns user's subscriptions"""
        self.client.force_authenticate(user=self.user)
        
        # Create subscriptions
        UserService.objects.create(user=self.user, service=self.timer_service)
        UserService.objects.create(user=self.user, service=self.github_service)
        
        response = self.client.get('/services/subscriptions/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
        service_names = [s['service_name'] for s in response.data]
        self.assertIn('timer', service_names)
        self.assertIn('github', service_names)
    
    def test_subscribe_invalid_data(self):
        """Test POST /services/<id>/subscribe/ with missing access_token"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post(
            f'/services/{self.timer_service.id}/subscribe/',
            {}
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error']['code'], 'VALIDATION_ERROR')
    
    def test_service_not_found(self):
        """Test endpoints with non-existent service ID"""
        fake_id = uuid.uuid4()
        
        response = self.client.get(f'/services/{fake_id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        response = self.client.get(f'/services/{fake_id}/actions/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class TokenEncryptionTestCase(TestCase):
    """Test suite for OAuth token encryption/decryption"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        
        self.service = Service.objects.create(
            name='test_service',
            display_name='Test Service'
        )
    
    def test_token_encryption(self):
        """Test that tokens are encrypted and can be decrypted"""
        user_service = UserService.objects.create(
            user=self.user,
            service=self.service
        )
        
        access_token = 'my_secret_access_token'
        refresh_token = 'my_secret_refresh_token'
        
        user_service.set_tokens(access_token, refresh_token)
        user_service.save()
        
        # Verify tokens are encrypted (not stored in plain text)
        self.assertNotEqual(user_service.access_token_enc, access_token)
        self.assertNotEqual(user_service.refresh_token_enc, refresh_token)
        
        # Verify tokens can be decrypted
        self.assertEqual(user_service.get_access_token(), access_token)
        self.assertEqual(user_service.get_refresh_token(), refresh_token)
    
    def test_empty_token_handling(self):
        """Test handling of empty tokens"""
        user_service = UserService.objects.create(
            user=self.user,
            service=self.service
        )
        
        user_service.set_tokens('access', '')
        user_service.save()
        
        self.assertEqual(user_service.get_access_token(), 'access')
        self.assertEqual(user_service.get_refresh_token(), '')
