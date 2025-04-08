from rest_framework import serializers
from user_registration.api.serializers import UserSerializer, SkillSerializer
from user_registration.models import Skill
from course.models import Course
from course.api.serializers import CourseListSerializer
from ..models import Resume, ResumeAnalysis, LearningPath, LearningPathItem, LearningNote

class ResumeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Resume
        fields = [
            'id', 'user', 'title', 'file', 'version', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Auto-increment version for the user's resumes
        user = self.context['request'].user
        latest_resume = Resume.objects.filter(user=user).order_by('-version').first()
        
        if latest_resume:
            validated_data['version'] = latest_resume.version + 1
        else:
            validated_data['version'] = 1
            
        validated_data['user'] = user
        return super().create(validated_data)

class ResumeAnalysisSerializer(serializers.ModelSerializer):
    resume = ResumeSerializer(read_only=True)
    resume_id = serializers.PrimaryKeyRelatedField(
        queryset=Resume.objects.all(),
        source='resume',
        write_only=True
    )
    
    class Meta:
        model = ResumeAnalysis
        fields = [
            'id', 'resume', 'resume_id', 'analysis_text', 'strengths',
            'weaknesses', 'improvement_suggestions', 'ai_generated_score',
            'analyzed_at'
        ]
        read_only_fields = ['analyzed_at']

class LearningNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningNote
        fields = [
            'id', 'user', 'title', 'content', 'learning_path_item',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class LearningPathItemSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        source='course',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    notes = LearningNoteSerializer(many=True, read_only=True)
    
    class Meta:
        model = LearningPathItem
        fields = [
            'id', 'learning_path', 'title', 'description', 'item_type',
            'course', 'course_id', 'external_url', 'order', 'priority',
            'estimated_completion_days', 'is_completed', 'completed_at',
            'notes'
        ]
        read_only_fields = ['completed_at']

class LearningPathSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    target_skills = SkillSerializer(many=True, read_only=True)
    target_skill_ids = serializers.PrimaryKeyRelatedField(
        source='target_skills',
        queryset=Skill.objects.all(),
        write_only=True,
        many=True,
        required=False
    )
    
    items = LearningPathItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = LearningPath
        fields = [
            'id', 'user', 'title', 'description', 'target_skills',
            'target_skill_ids', 'is_active', 'created_at', 'updated_at',
            'items'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)