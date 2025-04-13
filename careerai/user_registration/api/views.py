from rest_framework import viewsets, permissions, status, filters, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import logout, authenticate
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from datetime import timedelta
import uuid

from ..models import (
    User, Skill, Location, Company, EmploymentType,
    UserSkill, PasswordResetToken, VerificationToken, UserPreference
)
from .serializers import (
    UserSerializer, LoginSerializer, PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer, EmailVerificationSerializer,
    UserUpdateSerializer, ChangePasswordSerializer, SkillSerializer,
    LocationSerializer, CompanySerializer, EmploymentTypeSerializer,
    UserSkillSerializer, UserPreferenceSerializer
)

class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

class LocationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'city', 'state', 'country']

class CompanyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

class EmploymentTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EmploymentType.objects.all()
    serializer_class = EmploymentTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Regular users can only see their own profile
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)
    
    def get_permissions(self):
        """Allow anyone to register."""
        if self.action == 'create':
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get the current user's profile."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update the current user's profile."""
        user = request.user
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Return the full user serializer with updated data
        return Response(UserSerializer(user, context={'request': request}).data)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change the current user's password."""
        user = request.user
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Check current password
        if not user.check_password(serializer.validated_data['current_password']):
            return Response(
                {'current_password': ['Wrong password.']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({'detail': 'Password updated successfully.'})

class AuthViewSet(viewsets.ViewSet):
    """ViewSet for authentication-related actions."""
    
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        """Register a new user."""
        # Make a copy of the data to modify
        registration_data = request.data.copy()
        
        # Map password2 to confirm_password if it exists
        if 'password2' in registration_data and 'confirm_password' not in registration_data:
            registration_data['confirm_password'] = registration_data['password2']
        
        # Handle username/email - if username exists but is not a field in our model
        if 'username' in registration_data and not hasattr(User, 'username'):
            # We might want to check if the email is valid here
            if 'email' not in registration_data or not registration_data['email']:
                registration_data['email'] = registration_data['username']
        
        # Print received data for debugging
        print(f"Processing registration data: {registration_data}")
        
        try:
            serializer = UserSerializer(data=registration_data, context={'request': request})
            if not serializer.is_valid():
                # Print validation errors for debugging
                print(f"Registration validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user, context={'request': request}).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'detail': 'User registered successfully.'
            }, status=status.HTTP_201_CREATED)
        
        except serializers.ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Registration error: {str(e)}")
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """Login a user with enhanced response data."""
        print(f"Login attempt with data: {request.data}")
        serializer = LoginSerializer(data=request.data, context={'request': request})
        
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Include more user data in the response
            user_data = UserSerializer(user, context={'request': request}).data
            
            # Check if user has completed profile
            has_completed_profile = bool(
                user.first_name and user.last_name and 
                (hasattr(user, 'bio') and user.bio)
            )
            
            # Add some debug logging
            print(f"Login successful for {user.email}")
            print(f"Profile status: {'Completed' if has_completed_profile else 'Incomplete'}")
            
            return Response({
                'user': user_data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'profile_complete': has_completed_profile,
                'is_verified': getattr(user, 'is_verified', False),
                'status': 'success',
                'message': 'Login successful'
            })
            
        except serializers.ValidationError as e:
            print(f"Login failed: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Invalid credentials',
                'errors': e.detail
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        """Logout a user by blacklisting their refresh token."""
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"detail": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
                
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Successfully logged out.'})
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get', 'put', 'patch', 'post'])
    def profile(self, request):
        """Get or update the current user's profile with consistent response format."""
        if not request.user.is_authenticated:
            return Response({
                'status': 'error',
                'message': 'Authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Add debug logging
        print(f"Profile request: {request.method} from {request.user.email}")
        
        if request.method == 'GET':
            serializer = UserSerializer(request.user, context={'request': request})
            return Response({
                'status': 'success',
                'user': serializer.data,
                'profile_complete': bool(
                    request.user.first_name and request.user.last_name and 
                    (hasattr(request.user, 'bio') and request.user.bio)
                ),
                'is_verified': getattr(request.user, 'is_verified', False)
            })
        
        # Handle PUT, PATCH, and POST methods all the same way for profile updates
        print(f"Profile update data: {request.data}")
        
        # For debugging, let's log the current user fields
        user_fields = {
            field.name: getattr(request.user, field.name) 
            for field in request.user._meta.fields 
            if not field.is_relation
        }
        print(f"Current user fields: {user_fields}")
        
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            # Return the full user serializer with updated data
            return Response({
                'status': 'success',
                'message': 'Profile updated successfully',
                'user': UserSerializer(user, context={'request': request}).data,
                'profile_complete': bool(
                    user.first_name and user.last_name and 
                    (hasattr(user, 'bio') and user.bio)
                ),
                'is_verified': getattr(user, 'is_verified', False)
            })
        
        except serializers.ValidationError as e:
            print(f"Profile update validation error: {e.detail}")
            return Response({
                'status': 'error',
                'message': 'Invalid profile data',
                'errors': e.detail
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Profile update error: {str(e)}")
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        """Alias for profile endpoint to handle /api/auth/me/ requests."""
        # Just call the profile method with the same request
        return self.profile(request)
    
    @action(detail=False, methods=['post'])
    def request_password_reset(self, request):
        """Request a password reset."""
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = User.objects.get(email=serializer.validated_data['email'])
        
        # Create password reset token
        token = str(uuid.uuid4())
        expiry = timezone.now() + timedelta(days=1)
        PasswordResetToken.objects.create(
            user=user,
            token=token,
            expires_at=expiry
        )
        
        # Here you would typically send a password reset email
        # In a real application, integrate with an email service
        
        return Response({'detail': 'Password reset email sent.'})
    
    @action(detail=False, methods=['post'])
    def confirm_password_reset(self, request):
        """Confirm and complete a password reset."""
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get token and associated user
        reset_token = PasswordResetToken.objects.get(token=serializer.validated_data['token'])
        user = reset_token.user
        
        # Update password
        user.set_password(serializer.validated_data['password'])
        user.save()
        
        # Mark token as used
        reset_token.is_used = True
        reset_token.save()
        
        return Response({'detail': 'Password has been reset successfully.'})
    
    @action(detail=False, methods=['post'])
    def verify_email(self, request):
        """Verify a user's email address."""
        serializer = EmailVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get token and associated user
        verification_token = VerificationToken.objects.get(token=serializer.validated_data['token'])
        user = verification_token.user
        
        # Mark user as verified
        user.is_verified = True
        user.save()
        
        # Mark token as used
        verification_token.is_used = True
        verification_token.save()
        
        return Response({'detail': 'Email verified successfully.'})

class UserSkillViewSet(viewsets.ModelViewSet):
    serializer_class = UserSkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserSkill.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserPreferenceViewSet(viewsets.ModelViewSet):
    serializer_class = UserPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserPreference.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_preferences(self, request):
        """Get the current user's preferences."""
        try:
            preference = UserPreference.objects.get(user=request.user)
            serializer = self.get_serializer(preference)
            return Response(serializer.data)
        except UserPreference.DoesNotExist:
            preference = UserPreference.objects.create(user=request.user)
            serializer = self.get_serializer(preference)
            return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_preferences(self, request):
        """Update the current user's preferences."""
        try:
            preference = UserPreference.objects.get(user=request.user)
        except UserPreference.DoesNotExist:
            preference = UserPreference.objects.create(user=request.user)
        
        serializer = self.get_serializer(preference, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data)