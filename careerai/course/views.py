from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model

from .models import UserPreference, Course, UserCourseProgress, UserLearningPath
from .serializers import (
    UserPreferenceSerializer,
    CourseSerializer,
    UserCourseProgressSerializer,
    UserLearningPathSerializer,
)

User = get_user_model()


# Save user preferences
class UserPreferenceView(generics.RetrieveUpdateAPIView):
    serializer_class = UserPreferenceSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return UserPreference.objects.get_or_create(user=self.request.user)[0]

    def put(self, request, *args, **kwargs):
        user_pref = self.get_object()
        serializer = self.get_serializer(user_pref, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# List all available courses
class CourseListView(generics.ListAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]


# Track user course progress
class UserCourseProgressView(generics.RetrieveUpdateAPIView):
    serializer_class = UserCourseProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        course_id = self.kwargs.get("course_id")
        course = Course.objects.get(id=course_id)
        return UserCourseProgress.objects.get_or_create(user=self.request.user, course=course)[0]


# Manage user learning paths
class UserLearningPathView(generics.RetrieveUpdateAPIView):
    serializer_class = UserLearningPathSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return UserLearningPath.objects.get_or_create(user=self.request.user)[0]

    def put(self, request, *args, **kwargs):
        learning_path = self.get_object()
        serializer = self.get_serializer(learning_path, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
