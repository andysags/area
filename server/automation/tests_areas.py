from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from automation.models import Service, Action, Reaction, Area

User = get_user_model()


class AreaTests(TestCase):
    """Tests for AREA CRUD operations"""

    def setUp(self):
        self.client = APIClient()
        
        # Create test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='Test1234!'
        )
        
        # Create another user for isolation tests
        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='Test1234!'
        )
        
        # Authenticate
        self.client.force_authenticate(user=self.user)
        
        # Create test services
        self.timer_service = Service.objects.create(
            name='timer',
            display_name='Timer Service'
        )
        
        self.github_service = Service.objects.create(
            name='github',
            display_name='GitHub Service'
        )
        
        # Create test actions
        self.timer_action = Action.objects.create(
            service=self.timer_service,
            name='every_minute',
            description='Triggers every minute'
        )
        
        # Create test reactions
        self.github_reaction = Reaction.objects.create(
            service=self.github_service,
            name='create_issue',
            description='Create a GitHub issue'
        )

    def test_create_area_success(self):
        """Test creating an AREA with valid data"""
        area_data = {
            'action_service_id': 'timer',
            'action_name': 'every_minute',
            'reaction_service_id': 'github',
            'reaction_name': 'create_issue',
            'action_config': {},
            'reaction_config': {'repository': 'test/repo'}
        }
        
        response = self.client.post('/areas/', area_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Area.objects.filter(user=self.user).exists())
        
        area = Area.objects.get(user=self.user)
        self.assertEqual(area.action.name, 'every_minute')
        self.assertEqual(area.reaction.name, 'create_issue')

    def test_create_area_invalid_service(self):
        """Test creating an AREA with non-existent service"""
        area_data = {
            'action_service_id': 'nonexistent',
            'action_name': 'some_action',
            'reaction_service_id': 'github',
            'reaction_name': 'create_issue',
            'action_config': {},
            'reaction_config': {}
        }
        
        response = self.client.post('/areas/', area_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_user_areas(self):
        """Test listing AREAs for authenticated user"""
        # Create an AREA
        area = Area.objects.create(
            user=self.user,
            action=self.timer_action,
            reaction=self.github_reaction,
            config_action={'type': 'every_minute'},
            config_reaction={'type': 'create_issue', 'repository': 'test/repo'}
        )
        
        response = self.client.get('/areas/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], str(area.id))

    def test_area_isolation_between_users(self):
        """Test that users can only see their own AREAs"""
        # Create AREA for first user
        Area.objects.create(
            user=self.user,
            action=self.timer_action,
            reaction=self.github_reaction,
            config_action={'type': 'every_minute'},
            config_reaction={'type': 'create_issue'}
        )
        
        # Create AREA for second user
        Area.objects.create(
            user=self.other_user,
            action=self.timer_action,
            reaction=self.github_reaction,
            config_action={'type': 'every_minute'},
            config_reaction={'type': 'create_issue'}
        )
        
        # First user should only see their AREA
        response = self.client.get('/areas/')
        self.assertEqual(len(response.data), 1)

    def test_update_area_toggle_enabled(self):
        """Test toggling AREA enabled status"""
        area = Area.objects.create(
            user=self.user,
            action=self.timer_action,
            reaction=self.github_reaction,
            config_action={'type': 'every_minute'},
            config_reaction={'type': 'create_issue'},
            enabled=True
        )
        
        # Disable the AREA
        response = self.client.patch(f'/areas/{area.id}/', {'enabled': False}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        area.refresh_from_db()
        self.assertFalse(area.enabled)

    def test_delete_area(self):
        """Test deleting an AREA"""
        area = Area.objects.create(
            user=self.user,
            action=self.timer_action,
            reaction=self.github_reaction,
            config_action={'type': 'every_minute'},
            config_reaction={'type': 'create_issue'}
        )
        
        response = self.client.delete(f'/areas/{area.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Area.objects.filter(id=area.id).exists())

    def test_delete_area_other_user(self):
        """Test that users cannot delete other users' AREAs"""
        # Create AREA for other user
        area = Area.objects.create(
            user=self.other_user,
            action=self.timer_action,
            reaction=self.github_reaction,
            config_action={'type': 'every_minute'},
            config_reaction={'type': 'create_issue'}
        )
        
        # Try to delete as first user
        response = self.client.delete(f'/areas/{area.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Area.objects.filter(id=area.id).exists())

    def test_list_areas_unauthenticated(self):
        """Test that unauthenticated users cannot list AREAs"""
        self.client.force_authenticate(user=None)
        response = self.client.get('/areas/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
