from rest_framework import viewsets, status, permissions, serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from user_registration.models import (
    User, UserProfile, Skill, Company, Location, EducationLevel,
    EmploymentType, DesiredWorkEnvironment, JobRole
)
from user_registration.api.serializers import (
    UserSerializer, UserProfileSerializer, UserProfileDetailSerializer,
    SkillSerializer, CompanySerializer, LocationSerializer, EducationLevelSerializer,
    EmploymentTypeSerializer, DesiredWorkEnvironmentSerializer, JobRoleSerializer
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
                {"message": "Logout successful"},
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
        """
        Returns the user's profile with detailed data.
        Creates a minimal profile if one doesn't exist.
        """
        profile, created = UserProfile.objects.get_or_create(
            user=request.user,
            defaults={}  # Minimal defaults
        )
        
        # Get reference data for frontend use
        reference_data = {
            'skills': SkillSerializer(Skill.objects.all(), many=True).data,
            'companies': CompanySerializer(Company.objects.all(), many=True).data,
            'locations': LocationSerializer(Location.objects.all(), many=True).data,
            'education_levels': EducationLevelSerializer(EducationLevel.objects.all(), many=True).data,
            'employment_types': EmploymentTypeSerializer(EmploymentType.objects.all(), many=True).data,
            'work_environments': DesiredWorkEnvironmentSerializer(DesiredWorkEnvironment.objects.all(), many=True).data,
            'job_roles': JobRoleSerializer(JobRole.objects.all(), many=True).data,
        }
        
        serializer = UserProfileDetailSerializer(profile)
        return Response({
            'profile': serializer.data,
            'reference_data': reference_data
        })


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Handle both single item and bulk creation.
        For bulk creation, it expects a JSON with a "skills" array.
        """
        # Handle bulk format: {"skills": ["Python", "JavaScript"]}
        if isinstance(request.data, dict) and 'skills' in request.data:
            skills = request.data['skills']
            
            if isinstance(skills, list):
                # Convert string items to objects if needed
                skills_data = [{"name": item} if isinstance(item, str) else item for item in skills]
                return self._bulk_create(skills_data)
                
        # Default single item creation
        return super().create(request, *args, **kwargs)
    
    def _bulk_create(self, skills_data):
        """Helper method to handle bulk creation"""
        created_skills = []
        
        for item in skills_data:
            name = item['name']
            # Check if skill already exists
            skill, created = Skill.objects.get_or_create(
                name__iexact=name,
                defaults={"name": name}
            )
            created_skills.append(skill)
        
        serializer = self.get_serializer(created_skills, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    
    def create(self, request, *args, **kwargs):
        """
        Handle both single item and bulk creation.
        For bulk creation, it expects a JSON with a "companies" array.
        """
        # Handle bulk format: {"companies": ["Google", "Microsoft"]}
        if isinstance(request.data, dict) and 'companies' in request.data:
            companies = request.data['companies']
            
            if isinstance(companies, list):
                # Convert string items to objects if needed
                companies_data = [{"name": item} if isinstance(item, str) else item for item in companies]
                return self._bulk_create(companies_data)
                
        # Default single item creation
        return super().create(request, *args, **kwargs)
    
    def _bulk_create(self, companies_data):
        """Helper method to handle bulk creation"""
        created_companies = []
        
        for item in companies_data:
            name = item['name']
            # Check if company already exists
            company, created = Company.objects.get_or_create(
                name__iexact=name,
                defaults={"name": name}
            )
            created_companies.append(company)
        
        serializer = self.get_serializer(created_companies, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Handle both single item and bulk creation.
        For bulk creation, it expects a JSON with a "locations" array.
        """
        # Handle bulk format: {"locations": ["New York", "San Francisco"]}
        if isinstance(request.data, dict) and 'locations' in request.data:
            locations = request.data['locations']
            
            if isinstance(locations, list):
                # Convert string items to objects if needed
                locations_data = [{"name": item} if isinstance(item, str) else item for item in locations]
                return self._bulk_create(locations_data)
                
        # Default single item creation
        return super().create(request, *args, **kwargs)
    
    def _bulk_create(self, locations_data):
        """Helper method to handle bulk creation"""
        created_locations = []
        
        for item in locations_data:
            name = item['name']
            # Check if location already exists
            location, created = Location.objects.get_or_create(
                name__iexact=name,
                defaults={"name": name}
            )
            created_locations.append(location)
        
        serializer = self.get_serializer(created_locations, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EducationLevelViewSet(viewsets.ModelViewSet):
    queryset = EducationLevel.objects.all()
    serializer_class = EducationLevelSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Handle both single item and bulk creation.
        For bulk creation, it expects a JSON with an "education_levels" array.
        """
        # Handle bulk format: {"education_levels": ["Bachelor's", "Master's"]}
        if isinstance(request.data, dict) and 'education_levels' in request.data:
            levels = request.data['education_levels']
            
            if isinstance(levels, list):
                # Convert string items to objects if needed
                levels_data = [{"name": item} if isinstance(item, str) else item for item in levels]
                return self._bulk_create(levels_data)
                
        # Default single item creation
        return super().create(request, *args, **kwargs)
    
    def _bulk_create(self, levels_data):
        """Helper method to handle bulk creation"""
        created_levels = []
        
        for item in levels_data:
            name = item['name']
            # Check if education level already exists
            level, created = EducationLevel.objects.get_or_create(
                name__iexact=name,
                defaults={"name": name}
            )
            created_levels.append(level)
        
        serializer = self.get_serializer(created_levels, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EmploymentTypeViewSet(viewsets.ModelViewSet):
    queryset = EmploymentType.objects.all()
    serializer_class = EmploymentTypeSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Handle both single item and bulk creation.
        For bulk creation, it expects a JSON with an "employment_types" array.
        """
        # Handle bulk format: {"employment_types": ["full_time", "part_time"]}
        if isinstance(request.data, dict) and 'employment_types' in request.data:
            types = request.data['employment_types']
            
            if isinstance(types, list):
                # Convert string items to objects if needed
                types_data = [{"name": item} if isinstance(item, str) else item for item in types]
                return self._bulk_create(types_data)
                
        # Default single item creation
        return super().create(request, *args, **kwargs)
    
    def _bulk_create(self, types_data):
        """Helper method to handle bulk creation"""
        created_types = []
        
        for item in types_data:
            name = item['name']
            # Check if employment type already exists
            emp_type, created = EmploymentType.objects.get_or_create(
                name__iexact=name,
                defaults={"name": name}
            )
            created_types.append(emp_type)
        
        serializer = self.get_serializer(created_types, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DesiredWorkEnvironmentViewSet(viewsets.ModelViewSet):
    queryset = DesiredWorkEnvironment.objects.all()
    serializer_class = DesiredWorkEnvironmentSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Handle both single item and bulk creation.
        For bulk creation, it expects a JSON with a "work_environments" array.
        """
        # Handle bulk format: {"work_environments": ["remote", "hybrid"]}
        if isinstance(request.data, dict) and 'work_environments' in request.data:
            envs = request.data['work_environments']
            
            if isinstance(envs, list):
                # Convert string items to objects if needed
                envs_data = [{"name": item} if isinstance(item, str) else item for item in envs]
                return self._bulk_create(envs_data)
                
        # Default single item creation
        return super().create(request, *args, **kwargs)
    
    def _bulk_create(self, envs_data):
        """Helper method to handle bulk creation"""
        created_envs = []
        
        for item in envs_data:
            name = item['name']
            # Validate against choices
            if name not in dict(UserProfile.WORK_ENVIRONMENT_CHOICES):
                continue
                
            # Check if work environment already exists
            env, created = DesiredWorkEnvironment.objects.get_or_create(
                name=name
            )
            created_envs.append(env)
        
        serializer = self.get_serializer(created_envs, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class JobRoleViewSet(viewsets.ModelViewSet):
    queryset = JobRole.objects.all()
    serializer_class = JobRoleSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Handle both single item and bulk creation.
        For bulk creation, it expects a JSON with a "job_roles" array.
        """
        # Handle bulk format: {"job_roles": ["Software Engineer", "Data Scientist"]}
        if isinstance(request.data, dict) and 'job_roles' in request.data:
            roles = request.data['job_roles']
            
            if isinstance(roles, list):
                # Convert string items to objects if needed
                roles_data = [{"name": item} if isinstance(item, str) else item for item in roles]
                return self._bulk_create(roles_data)
                
        # Default single item creation
        return super().create(request, *args, **kwargs)
    
    def _bulk_create(self, roles_data):
        """Helper method to handle bulk creation"""
        created_roles = []
        
        for item in roles_data:
            name = item['name']
            # Check if job role already exists
            role, created = JobRole.objects.get_or_create(
                name__iexact=name,
                defaults={"name": name}
            )
            created_roles.append(role)
        
        serializer = self.get_serializer(created_roles, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)