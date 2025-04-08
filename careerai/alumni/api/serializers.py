from rest_framework import serializers
from user_registration.api.serializers import (
    UserSerializer, CompanySerializer, SkillSerializer, LocationSerializer
)
from user_registration.models import Company, Skill, Location
from ..models import (
    Alumni, MentorshipArea, MentorProfile, MentorshipRequest,
    MentorshipRelationship, MentorshipSession, AlumniEvent,
    EventRegistration, AlumniReferral
)
from learning.models import Resume

class MentorshipAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorshipArea
        fields = '__all__'

class AlumniSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    current_company = CompanySerializer(read_only=True)
    current_company_id = serializers.PrimaryKeyRelatedField(
        source='current_company', 
        queryset=Company.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        source='skills',
        queryset=Skill.objects.all(),
        write_only=True,
        many=True,
        required=False
    )
    
    is_mentor = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Alumni
        fields = [
            'id', 'user', 'graduation_year', 'current_company',
            'current_company_id', 'position', 'bio', 'linkedin_profile',
            'github_profile', 'portfolio_url', 'is_mentor',
            'is_available_for_referrals', 'skills', 'skill_ids',
            'registered_at'
        ]
        read_only_fields = ['user', 'registered_at']
    
    def create(self, validated_data):
        # Connect to the authenticated user
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)

class MentorProfileSerializer(serializers.ModelSerializer):
    alumni = AlumniSerializer(read_only=True)
    alumni_id = serializers.PrimaryKeyRelatedField(
        source='alumni',
        queryset=Alumni.objects.all(),
        write_only=True
    )
    
    expertise_areas = MentorshipAreaSerializer(many=True, read_only=True)
    expertise_area_ids = serializers.PrimaryKeyRelatedField(
        source='expertise_areas',
        queryset=MentorshipArea.objects.all(),
        write_only=True,
        many=True
    )
    
    current_mentee_count = serializers.SerializerMethodField()
    is_available = serializers.SerializerMethodField()
    
    class Meta:
        model = MentorProfile
        fields = [
            'id', 'alumni', 'alumni_id', 'expertise_areas',
            'expertise_area_ids', 'availability', 'experience_years',
            'max_mentees', 'mentorship_style', 'is_active',
            'current_mentee_count', 'is_available'
        ]
    
    def get_current_mentee_count(self, obj):
        return obj.current_mentee_count()
    
    def get_is_available(self, obj):
        return obj.is_available()
    
    def create(self, validated_data):
        mentor_profile = super().create(validated_data)
        
        # Update the alumni record to mark as mentor
        alumni = mentor_profile.alumni
        alumni.is_mentor = True
        alumni.save()
        
        return mentor_profile

class MentorshipRequestSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    mentor = MentorProfileSerializer(read_only=True)
    mentor_id = serializers.PrimaryKeyRelatedField(
        source='mentor',
        queryset=MentorProfile.objects.all(),
        write_only=True
    )
    
    areas_of_interest = MentorshipAreaSerializer(many=True, read_only=True)
    area_of_interest_ids = serializers.PrimaryKeyRelatedField(
        source='areas_of_interest',
        queryset=MentorshipArea.objects.all(),
        write_only=True,
        many=True
    )
    
    class Meta:
        model = MentorshipRequest
        fields = [
            'id', 'user', 'mentor', 'mentor_id', 'message',
            'areas_of_interest', 'area_of_interest_ids', 'status',
            'requested_at', 'responded_at'
        ]
        read_only_fields = ['user', 'status', 'requested_at', 'responded_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class MentorshipRelationshipSerializer(serializers.ModelSerializer):
    mentor = MentorProfileSerializer(read_only=True)
    mentee = UserSerializer(read_only=True)
    
    class Meta:
        model = MentorshipRelationship
        fields = [
            'id', 'mentor', 'mentee', 'goals', 'status',
            'started_at', 'ended_at'
        ]
        read_only_fields = ['started_at', 'ended_at']

class MentorshipSessionSerializer(serializers.ModelSerializer):
    relationship = MentorshipRelationshipSerializer(read_only=True)
    relationship_id = serializers.PrimaryKeyRelatedField(
        source='relationship',
        queryset=MentorshipRelationship.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = MentorshipSession
        fields = [
            'id', 'relationship', 'relationship_id', 'title', 'date',
            'duration_minutes', 'topics_discussed', 'action_items',
            'notes', 'created_at'
        ]
        read_only_fields = ['created_at']

class AlumniEventSerializer(serializers.ModelSerializer):
    organizer = UserSerializer(read_only=True)
    
    location = LocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(
        source='location',
        queryset=Location.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    
    is_past = serializers.SerializerMethodField()
    is_ongoing = serializers.SerializerMethodField()
    is_registered = serializers.SerializerMethodField()
    registration_count = serializers.SerializerMethodField()
    
    class Meta:
        model = AlumniEvent
        fields = [
            'id', 'title', 'description', 'event_type', 'start_datetime',
            'end_datetime', 'location', 'location_id', 'is_virtual',
            'virtual_meeting_url', 'organizer', 'max_participants',
            'registration_deadline', 'created_at', 'is_past',
            'is_ongoing', 'is_registered', 'registration_count'
        ]
        read_only_fields = ['organizer', 'created_at']
    
    def get_is_past(self, obj):
        return obj.is_past()
    
    def get_is_ongoing(self, obj):
        return obj.is_ongoing()
    
    def get_is_registered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return EventRegistration.objects.filter(
                event=obj, 
                user=request.user
            ).exists()
        return False
    
    def get_registration_count(self, obj):
        return obj.registrations.count()
    
    def create(self, validated_data):
        validated_data['organizer'] = self.context['request'].user
        return super().create(validated_data)

class EventRegistrationSerializer(serializers.ModelSerializer):
    event = AlumniEventSerializer(read_only=True)
    event_id = serializers.PrimaryKeyRelatedField(
        source='event',
        queryset=AlumniEvent.objects.all(),
        write_only=True
    )
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = EventRegistration
        fields = [
            'id', 'event', 'event_id', 'user', 'registered_at',
            'attended', 'feedback'
        ]
        read_only_fields = ['user', 'registered_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class AlumniReferralSerializer(serializers.ModelSerializer):
    requester = UserSerializer(read_only=True)
    
    alumni = AlumniSerializer(read_only=True)
    alumni_id = serializers.PrimaryKeyRelatedField(
        source='alumni',
        queryset=Alumni.objects.all(),
        write_only=True
    )
    
    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        source='company',
        queryset=Company.objects.all(),
        write_only=True
    )
    
    resume = serializers.PrimaryKeyRelatedField(
        queryset=Resume.objects.all(),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = AlumniReferral
        fields = [
            'id', 'requester', 'alumni', 'alumni_id', 'company',
            'company_id', 'position', 'message', 'resume', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['requester', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['requester'] = self.context['request'].user
        return super().create(validated_data)