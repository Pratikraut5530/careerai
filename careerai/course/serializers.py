from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserPreference, Course, UserCourseProgress, UserLearningPath

User = get_user_model()


class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = ["user", "selected_fields", "created_at"]
        read_only_fields = ["created_at"]


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "title", "url", "channel", "field", "created_at"]
        read_only_fields = ["created_at"]


class UserCourseProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCourseProgress
        fields = ["user", "course", "progress", "completed", "last_accessed"]
        read_only_fields = ["last_accessed"]


class UserLearningPathSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLearningPath
        fields = ["user", "courses", "created_at"]
        read_only_fields = ["created_at"]
