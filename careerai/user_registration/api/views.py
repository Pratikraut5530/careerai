from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from user_registration.models import (
    User, UserProfile, Skill, Industry, EducationLevel,
    PreferredEmploymentType, DesiredWorkEnvironment, JobRole
)
from user_registration.api.serializers import (
    UserSerializer, UserProfileSerializer, UserProfileDetailSerializer,
    SkillSerializer, IndustrySerializer, EducationLevelSerializer,
    PreferredEmploymentTypeSerializer, DesiredWorkEnvironmentSerializer,
    JobRoleSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action in ['register', 'login']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "user": UserSerializer(user, context={"request": request}).data,
                "message": "User created successfully"
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        
        if not email or not password:
            return Response(
                {"error": "Please provide both email and password"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(email=email, password=password)
        
        if not user:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        })
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response(
                {"message": "Logged out"},
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.serializer_class(request.user)
        return Response(serializer.data)


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'me']:
            return UserProfileDetailSerializer
        return UserProfileSerializer
    
    def perform_create(self, serializer):
        # Check if user already has a profile
        if UserProfile.objects.filter(user=self.request.user).exists():
            raise serializers.ValidationError({"error": "You already have a profile"})
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = UserProfileDetailSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer


class IndustryViewSet(viewsets.ModelViewSet):
    queryset = Industry.objects.all()
    serializer_class = IndustrySerializer


class EducationLevelViewSet(viewsets.ModelViewSet):
    queryset = EducationLevel.objects.all()
    serializer_class = EducationLevelSerializer


class PreferredEmploymentTypeViewSet(viewsets.ModelViewSet):
    queryset = PreferredEmploymentType.objects.all()
    serializer_class = PreferredEmploymentTypeSerializer


class DesiredWorkEnvironmentViewSet(viewsets.ModelViewSet):
    queryset = DesiredWorkEnvironment.objects.all()
    serializer_class = DesiredWorkEnvironmentSerializer


class JobRoleViewSet(viewsets.ModelViewSet):
    queryset = JobRole.objects.all()
    serializer_class = JobRoleSerializer