from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from ..models import (
    User, UserProfile, Skill, Company, Location, 
    EducationLevel, EmploymentType, DesiredWorkEnvironment, JobRole
)

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password2', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'), username=email, password=password)
            if not user:
                raise serializers.ValidationError('Unable to log in with provided credentials.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
        else:
            raise serializers.ValidationError('Must include "email" and "password".')

        attrs['user'] = user
        return attrs

class UserSerializer(serializers.ModelSerializer):
    is_profile_completed = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'is_profile_completed')
        read_only_fields = ('email',)

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class EducationLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducationLevel
        fields = '__all__'

class EmploymentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmploymentType
        fields = '__all__'

class DesiredWorkEnvironmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DesiredWorkEnvironment
        fields = '__all__'

class JobRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobRole
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(),
        source='location',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    preferred_employment_type = EmploymentTypeSerializer(read_only=True)
    preferred_employment_type_id = serializers.PrimaryKeyRelatedField(
        queryset=EmploymentType.objects.all(),
        source='preferred_employment_type',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    education_level = EducationLevelSerializer(read_only=True)
    education_level_id = serializers.PrimaryKeyRelatedField(
        queryset=EducationLevel.objects.all(),
        source='education_level',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    desired_work_environments = DesiredWorkEnvironmentSerializer(many=True, read_only=True)
    desired_work_environment_ids = serializers.PrimaryKeyRelatedField(
        queryset=DesiredWorkEnvironment.objects.all(),
        source='desired_work_environments',
        write_only=True,
        required=False,
        many=True
    )
    
    companies_of_interest = CompanySerializer(many=True, read_only=True)
    companies_of_interest_ids = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        source='companies_of_interest',
        write_only=True,
        required=False,
        many=True
    )
    
    job_roles_of_interest = JobRoleSerializer(many=True, read_only=True)
    job_roles_of_interest_ids = serializers.PrimaryKeyRelatedField(
        queryset=JobRole.objects.all(),
        source='job_roles_of_interest',
        write_only=True,
        required=False,
        many=True
    )
    
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        source='skills',
        write_only=True,
        required=False,
        many=True
    )
    
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = (
            'id', 'user', 'location', 'location_id', 'employment_status',
            'preferred_employment_type', 'preferred_employment_type_id',
            'desired_work_environments', 'desired_work_environment_ids',
            'education_level', 'education_level_id', 'years_of_experience',
            'companies_of_interest', 'companies_of_interest_ids',
            'job_roles_of_interest', 'job_roles_of_interest_ids',
            'skills', 'skill_ids', 'career_vision', 'portfolio_url',
            'is_actively_job_searching', 'created_at', 'updated_at'
        )
        read_only_fields = ('created_at', 'updated_at')