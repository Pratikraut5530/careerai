from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError

class User(AbstractUser):
    email = models.EmailField(_('email address'), unique=True)
    is_profile_completed = models.BooleanField(default=False)
    
    # Specify related_name to avoid clashes with auth.User model
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name=_('groups'),
        blank=True,
        help_text=_('The groups this user belongs to.'),
        related_name='user_registration_users'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name=_('user permissions'),
        blank=True,
        help_text=_('Specific permissions for this user.'),
        related_name='user_registration_users'
    )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name


class Company(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    class Meta:
        verbose_name_plural = "Companies"
    
    def __str__(self):
        return self.name


class Location(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name


class EducationLevel(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name


class EmploymentType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name


class UserProfile(models.Model):
    EMPLOYMENT_STATUS_CHOICES = (
        ('employed', 'Employed'),
        ('unemployed', 'Unemployed'),
        ('student', 'Student'),
        ('freelancer', 'Freelancer'),
    )
    
    WORK_ENVIRONMENT_CHOICES = (
        ('remote', 'Remote'),
        ('hybrid', 'Hybrid'),
        ('on_site', 'On-site'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    location = models.ForeignKey(
        Location,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='profiles'
    )
    
    # Career preferences
    employment_status = models.CharField(max_length=20, choices=EMPLOYMENT_STATUS_CHOICES, blank=True, null=True)
    
    # Employment type is now a foreign key
    preferred_employment_type = models.ForeignKey(
        EmploymentType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='profiles'
    )
    
    desired_work_environments = models.ManyToManyField(
        'DesiredWorkEnvironment', 
        related_name='user_profiles',
        blank=True
    )
    
    # Education and experience
    education_level = models.ForeignKey(
        EducationLevel, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    
    years_of_experience = models.IntegerField(default=0)
    
    # References to other models
    companies_of_interest = models.ManyToManyField(
        Company, 
        related_name='interested_users',
        blank=True
    )
    
    job_roles_of_interest = models.ManyToManyField(
        'JobRole', 
        related_name='interested_users',
        blank=True
    )
    
    skills = models.ManyToManyField(
        Skill, 
        related_name='users',
        blank=True
    )
    
    # Optional fields
    career_vision = models.TextField(blank=True, null=True)
    portfolio_url = models.URLField(blank=True, null=True)
    
    # Job search status
    is_actively_job_searching = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email}'s Profile"
    
    def save(self, *args, **kwargs):
        # Check for existing profile for this user (if this is a new profile)
        if not self.pk and UserProfile.objects.filter(user=self.user).exists():
            raise ValidationError("A profile already exists for this user")
        
        if not self.pk:  # First save
            user = self.user
            user.is_profile_completed = True
            user.save()
        super().save(*args, **kwargs)


class DesiredWorkEnvironment(models.Model):
    name = models.CharField(max_length=50, choices=UserProfile.WORK_ENVIRONMENT_CHOICES, unique=True)
    
    def __str__(self):
        return self.name


class JobRole(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name