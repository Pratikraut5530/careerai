from rest_framework import serializers
from user_registration.models import (
    User, UserProfile, Skill, Company, Location, EducationLevel,
    EmploymentType, DesiredWorkEnvironment, JobRole
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'password', 'is_profile_completed')
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ('id', 'name')


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ('id', 'name')


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ('id', 'name')


class EducationLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducationLevel
        fields = ('id', 'name')


class EmploymentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmploymentType
        fields = ('id', 'name')


class DesiredWorkEnvironmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DesiredWorkEnvironment
        fields = ('id', 'name')


class JobRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobRole
        fields = ('id', 'name')


class UserProfileSerializer(serializers.ModelSerializer):
    # IDs for relations
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(),
        source='location',
        required=False,
        allow_null=True
    )
    
    education_level_id = serializers.PrimaryKeyRelatedField(
        queryset=EducationLevel.objects.all(),
        source='education_level',
        required=False,
        allow_null=True
    )
    
    preferred_employment_type_id = serializers.PrimaryKeyRelatedField(
        queryset=EmploymentType.objects.all(),
        source='preferred_employment_type',
        required=False,
        allow_null=True
    )
    
    desired_work_environments = serializers.PrimaryKeyRelatedField(
        queryset=DesiredWorkEnvironment.objects.all(),
        many=True,
        required=False
    )
    
    companies_of_interest = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        many=True,
        required=False
    )
    
    job_roles_of_interest = serializers.PrimaryKeyRelatedField(
        queryset=JobRole.objects.all(),
        many=True,
        required=False
    )
    
    skills = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        many=True,
        required=False
    )
    
    class Meta:
        model = UserProfile
        fields = (
            'id', 'user', 'location_id', 'employment_status', 'preferred_employment_type_id',
            'education_level_id', 'desired_work_environments',
            'years_of_experience', 'companies_of_interest', 'job_roles_of_interest',
            'skills', 'career_vision', 'portfolio_url', 'is_actively_job_searching',
            'created_at', 'updated_at'
        )
        read_only_fields = ('user', 'created_at', 'updated_at')


class UserProfileDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    education_level = EducationLevelSerializer(read_only=True)
    preferred_employment_type = EmploymentTypeSerializer(read_only=True)
    desired_work_environments = DesiredWorkEnvironmentSerializer(many=True, read_only=True)
    companies_of_interest = CompanySerializer(many=True, read_only=True)
    job_roles_of_interest = JobRoleSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    
    class Meta:
        model = UserProfile
        fields = (
            'id', 'user', 'location', 'employment_status', 'preferred_employment_type',
            'desired_work_environments', 'education_level', 'years_of_experience',
            'companies_of_interest', 'job_roles_of_interest', 'skills', 
            'career_vision', 'portfolio_url', 'is_actively_job_searching',
            'created_at', 'updated_at'
        )