from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action

from user_registration.api.permissions import IsAuthenticatedOrRegistering
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
    permission_classes = [IsAuthenticatedOrRegistering]
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "user": UserSerializer(user, context={"request": request}).data,
                "message": "User created successfully"
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'me']:
            return UserProfileDetailSerializer
        return UserProfileSerializer
    
    def perform_create(self, serializer):
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