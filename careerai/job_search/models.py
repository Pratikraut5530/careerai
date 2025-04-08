from django.db import models
from django.utils import timezone
from user_registration.models import User, Skill, Company, Location, EmploymentType

class JobListing(models.Model):
    APPLICATION_STATUS_CHOICES = (
        ('open', 'Open'),
        ('closed', 'Closed'),
    )
    
    title = models.CharField(max_length=200)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='job_listings')
    description = models.TextField()
    requirements = models.TextField()
    responsibilities = models.TextField()
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='job_listings')
    employment_type = models.ForeignKey(EmploymentType, on_delete=models.CASCADE, related_name='job_listings')
    is_remote = models.BooleanField(default=False)
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    required_skills = models.ManyToManyField(Skill, related_name='required_for_jobs')
    preferred_skills = models.ManyToManyField(Skill, related_name='preferred_for_jobs', blank=True)
    experience_required_years = models.PositiveIntegerField(default=0)
    apply_url = models.URLField(blank=True, null=True)
    application_status = models.CharField(max_length=10, choices=APPLICATION_STATUS_CHOICES, default='open')
    posted_at = models.DateTimeField(default=timezone.now)
    closes_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.title} at {self.company.name}"
    
    def is_active(self):
        if self.application_status == 'closed':
            return False
        if self.closes_at and self.closes_at < timezone.now():
            return False
        return True

class JobApplication(models.Model):
    STATUS_CHOICES = (
        ('applied', 'Applied'),
        ('screening', 'Screening'),
        ('interview', 'Interview'),
        ('technical_test', 'Technical Test'),
        ('offer', 'Offer'),
        ('rejected', 'Rejected'),
        ('accepted', 'Accepted'),
        ('withdrawn', 'Withdrawn'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_applications')
    job = models.ForeignKey(JobListing, on_delete=models.CASCADE, related_name='applications')
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)
    cover_letter = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    applied_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'job']
    
    def __str__(self):
        return f"{self.user.email} - {self.job.title} ({self.status})"

class SavedJob(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_jobs')
    job = models.ForeignKey(JobListing, on_delete=models.CASCADE, related_name='saved_by')
    saved_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ['user', 'job']
    
    def __str__(self):
        return f"{self.user.email} saved {self.job.title}"

class JobAlert(models.Model):
    FREQUENCY_CHOICES = (
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('biweekly', 'Bi-Weekly'),
        ('monthly', 'Monthly'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_alerts')
    title = models.CharField(max_length=100)
    keywords = models.CharField(max_length=255, blank=True, null=True)
    locations = models.ManyToManyField(Location, blank=True, related_name='job_alerts')
    skills = models.ManyToManyField(Skill, blank=True, related_name='job_alerts')
    experience_min = models.PositiveIntegerField(default=0)
    experience_max = models.PositiveIntegerField(default=99)
    is_remote = models.BooleanField(null=True, blank=True)
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='weekly')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    last_sent_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"

class ColdEmail(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('received', 'Received'),
        ('replied', 'Replied'),
        ('no_response', 'No Response'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cold_emails')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='cold_emails')
    recipient_name = models.CharField(max_length=100)
    recipient_email = models.EmailField()
    recipient_position = models.CharField(max_length=100, blank=True, null=True)
    subject = models.CharField(max_length=200)
    content = models.TextField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(default=timezone.now)
    sent_at = models.DateTimeField(null=True, blank=True)
    last_follow_up = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.email} to {self.recipient_name} at {self.company.name}"