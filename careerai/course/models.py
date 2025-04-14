import os
import django
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project.settings')
django.setup()

User = get_user_model()


# User Preferences Model
class UserPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="preference")
    selected_fields = models.JSONField(default=list)  # Store selected fields as a list
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.email} - Interests: {', '.join(self.selected_fields)}"


# Course Model
class Course(models.Model):
    title = models.CharField(max_length=255)
    url = models.URLField()
    channel = models.CharField(max_length=255, blank=True, null=True)
    field = models.CharField(max_length=255)  # Related field of study
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title


# User Learning Progress
class UserCourseProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="course_progress")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="progress")
    progress = models.FloatField(default=0.0)  # Percentage completed
    completed = models.BooleanField(default=False)
    last_accessed = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.course.title} ({self.progress}% completed)"


# User Learning Path
class UserLearningPath(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="learning_paths")
    courses = models.ManyToManyField(Course, related_name="learning_paths")
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.email} - Learning Path"