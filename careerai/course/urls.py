from django.urls import path
from .views import (
    UserPreferenceView,
    CourseListView,
    UserCourseProgressView,
    UserLearningPathView,
)

urlpatterns = [
    path("preferences/", UserPreferenceView.as_view(), name="user-preference"),
    path("courses/", CourseListView.as_view(), name="course-list"),
    path("progress/<int:course_id>/", UserCourseProgressView.as_view(), name="course-progress"),
    path("learning-path/", UserLearningPathView.as_view(), name="user-learning-path"),
]
