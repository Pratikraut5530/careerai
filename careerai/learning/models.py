from django.db import models
from django.utils import timezone
from user_registration.models import User, Skill

class Resume(models.Model):
    RESUME_STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('submitted', 'Submitted for Review'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    title = models.CharField(max_length=100)
    file = models.FileField(upload_to='user_resumes/')
    version = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=15, choices=RESUME_STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.title} (v{self.version})"

class ResumeAnalysis(models.Model):
    resume = models.OneToOneField(Resume, on_delete=models.CASCADE, related_name='analysis')
    analysis_text = models.TextField()
    strengths = models.TextField()
    weaknesses = models.TextField()
    improvement_suggestions = models.TextField()
    ai_generated_score = models.DecimalField(max_digits=3, decimal_places=1, null=True)
    analyzed_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"Analysis for {self.resume}"

class LearningPath(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='learning_paths')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    target_skills = models.ManyToManyField(Skill, related_name='learning_paths')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"

class LearningPathItem(models.Model):
    ITEM_TYPES = (
        ('course', 'Course'),
        ('project', 'Project'),
        ('resource', 'Resource'),
        ('assessment', 'Assessment'),
    )
    
    PRIORITY_LEVELS = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    )
    
    learning_path = models.ForeignKey(LearningPath, on_delete=models.CASCADE, related_name='items')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    item_type = models.CharField(max_length=15, choices=ITEM_TYPES)
    course = models.ForeignKey('course.Course', on_delete=models.SET_NULL, null=True, blank=True, related_name='learning_path_items')
    external_url = models.URLField(blank=True, null=True)
    order = models.PositiveIntegerField(default=1)
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')
    estimated_completion_days = models.PositiveIntegerField(default=7)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.learning_path.title} - {self.title}"
    
    def mark_as_completed(self):
        self.is_completed = True
        self.completed_at = timezone.now()
        self.save()

class LearningNote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='learning_notes')
    title = models.CharField(max_length=200)
    content = models.TextField()
    learning_path_item = models.ForeignKey(LearningPathItem, on_delete=models.SET_NULL, null=True, blank=True, related_name='notes')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"