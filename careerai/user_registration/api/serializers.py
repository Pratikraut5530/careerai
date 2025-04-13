from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta
import uuid

from ..models import (
    User, Skill, Location, Company, EmploymentType,
    UserSkill, PasswordResetToken, VerificationToken, UserPreference
)

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class CompanySerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(
        source='location',
        queryset=Location.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'description', 'website', 'logo',
            'location', 'location_id'
        ]

class EmploymentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmploymentType
        fields = '__all__'

class UserSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    skill_id = serializers.PrimaryKeyRelatedField(
        source='skill',
        queryset=Skill.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = UserSkill
        fields = [
            'id', 'user', 'skill', 'skill_id', 'proficiency_level',
            'years_experience', 'is_primary'
        ]
        read_only_fields = ['user']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = [
            'id', 'theme', 'language', 'timezone', 'dashboard_widgets'
        ]
        read_only_fields = ['user']

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    skills = serializers.SerializerMethodField()
    preferences = UserPreferenceSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'password', 'confirm_password', 'first_name', 'last_name',
            'bio', 'profile_picture', 'phone_number', 'current_position',
            'years_of_experience', 'email_notifications', 'job_alert_notifications',
            'course_notifications', 'date_joined', 'is_verified', 'skills', 'preferences'
        ]
        read_only_fields = ['date_joined', 'is_verified']
    
    def get_skills(self, obj):
        user_skills = UserSkill.objects.filter(user=obj)
        return UserSkillSerializer(user_skills, many=True, context=self.context).data
    
    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": _("Passwords do not match.")})
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        # Check if user already exists
        email = validated_data.get('email')
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "User with this email already exists."})
        
        # Create the user
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        try:
            # Create default user preferences if they don't exist
            UserPreference.objects.get_or_create(user=user)
            
            # Create verification token
            token = str(uuid.uuid4())
            expiry = timezone.now() + timedelta(days=7)
            VerificationToken.objects.create(
                user=user,
                token=token,
                expires_at=expiry
            )
        except Exception as e:
            print(f"Error during user setup: {str(e)}")
            # We still want to return the user even if preferences setup fails
        
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, style={'input_type': 'password'})
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            user = authenticate(request=self.context.get('request'), username=email, password=password)
            if not user:
                raise serializers.ValidationError(_("Invalid email or password."))
            if not user.is_active:
                raise serializers.ValidationError(_("This account is inactive."))
        else:
            raise serializers.ValidationError(_("Must include 'email' and 'password'."))
        
        data['user'] = user
        return data

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError(_("No user found with this email address."))
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    password = serializers.CharField(required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(required=True, style={'input_type': 'password'})
    
    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": _("Passwords do not match.")})
        
        try:
            reset_token = PasswordResetToken.objects.get(token=data.get('token'))
            if not reset_token.is_valid():
                raise serializers.ValidationError({"token": _("Invalid or expired token.")})
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError({"token": _("Invalid token.")})
        
        return data

class EmailVerificationSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    
    def validate_token(self, value):
        try:
            verification_token = VerificationToken.objects.get(token=value)
            if not verification_token.is_valid():
                raise serializers.ValidationError(_("Invalid or expired token."))
        except VerificationToken.DoesNotExist:
            raise serializers.ValidationError(_("Invalid token."))
        return value

class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profiles."""
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'bio', 'profile_picture', 
            'phone_number', 'current_position', 'years_of_experience',
            'email_notifications', 'job_alert_notifications', 
            'course_notifications'
        ]
        
    def validate_email(self, value):
        """Ensure email isn't being changed or is unique if it is."""
        user = self.instance
        if user.email != value:
            if User.objects.filter(email=value).exists():
                raise serializers.ValidationError("A user with this email already exists.")
        return value

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(required=True, style={'input_type': 'password'})
    
    def validate(self, data):
        if data.get('new_password') != data.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": _("Passwords do not match.")})
        return data