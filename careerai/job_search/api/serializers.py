from rest_framework import serializers
from user_registration.api.serializers import (
    CompanySerializer, LocationSerializer, EmploymentTypeSerializer, SkillSerializer
)
from user_registration.models import Company, Location, EmploymentType, Skill
from ..models import JobListing, JobApplication, SavedJob, JobAlert, ColdEmail

class JobListingSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        source='company', 
        queryset=Company.objects.all(),
        write_only=True
    )
    
    location = LocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(
        source='location', 
        queryset=Location.objects.all(),
        write_only=True
    )
    
    employment_type = EmploymentTypeSerializer(read_only=True)
    employment_type_id = serializers.PrimaryKeyRelatedField(
        source='employment_type', 
        queryset=EmploymentType.objects.all(),
        write_only=True
    )
    
    required_skills = SkillSerializer(many=True, read_only=True)
    required_skill_ids = serializers.PrimaryKeyRelatedField(
        source='required_skills',
        queryset=Skill.objects.all(),
        write_only=True,
        many=True
    )
    
    preferred_skills = SkillSerializer(many=True, read_only=True)
    preferred_skill_ids = serializers.PrimaryKeyRelatedField(
        source='preferred_skills',
        queryset=Skill.objects.all(),
        write_only=True,
        many=True,
        required=False
    )
    
    is_saved = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()
    is_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = JobListing
        fields = [
            'id', 'title', 'company', 'company_id', 'description', 'requirements',
            'responsibilities', 'location', 'location_id', 'employment_type',
            'employment_type_id', 'is_remote', 'salary_min', 'salary_max',
            'required_skills', 'required_skill_ids', 'preferred_skills',
            'preferred_skill_ids', 'experience_required_years', 'apply_url',
            'application_status', 'posted_at', 'closes_at', 'is_active',
            'is_saved', 'has_applied'
        ]
        read_only_fields = ['posted_at', 'is_active']
    
    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedJob.objects.filter(user=request.user, job=obj).exists()
        return False
    
    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return JobApplication.objects.filter(user=request.user, job=obj).exists()
        return False

class JobApplicationSerializer(serializers.ModelSerializer):
    job = JobListingSerializer(read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(
        source='job',
        queryset=JobListing.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = JobApplication
        fields = [
            'id', 'user', 'job', 'job_id', 'resume', 'cover_letter',
            'status', 'applied_at', 'updated_at', 'notes'
        ]
        read_only_fields = ['user', 'applied_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class SavedJobSerializer(serializers.ModelSerializer):
    job = JobListingSerializer(read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(
        source='job',
        queryset=JobListing.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = SavedJob
        fields = ['id', 'user', 'job', 'job_id', 'saved_at']
        read_only_fields = ['user', 'saved_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class JobAlertSerializer(serializers.ModelSerializer):
    locations = LocationSerializer(many=True, read_only=True)
    location_ids = serializers.PrimaryKeyRelatedField(
        source='locations',
        queryset=Location.objects.all(),
        write_only=True,
        many=True,
        required=False
    )
    
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        source='skills',
        queryset=Skill.objects.all(),
        write_only=True,
        many=True,
        required=False
    )
    
    class Meta:
        model = JobAlert
        fields = [
            'id', 'user', 'title', 'keywords', 'locations', 'location_ids',
            'skills', 'skill_ids', 'experience_min', 'experience_max',
            'is_remote', 'frequency', 'is_active', 'created_at', 'last_sent_at'
        ]
        read_only_fields = ['user', 'created_at', 'last_sent_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class ColdEmailSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        source='company',
        queryset=Company.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = ColdEmail
        fields = [
            'id', 'user', 'company', 'company_id', 'recipient_name',
            'recipient_email', 'recipient_position', 'subject', 'content',
            'status', 'created_at', 'sent_at', 'last_follow_up', 'notes'
        ]
        read_only_fields = ['user', 'created_at', 'sent_at', 'last_follow_up']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)