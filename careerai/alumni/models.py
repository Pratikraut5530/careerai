from django.db import models
from django.utils import timezone
from user_registration.models import User, Company, Skill, Location

class Alumni(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='alumni_profile')
    graduation_year = models.PositiveIntegerField()
    current_company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name='alumni')
    position = models.CharField(max_length=100)
    bio = models.TextField(blank=True, null=True)
    linkedin_profile = models.URLField(blank=True, null=True)
    github_profile = models.URLField(blank=True, null=True)
    portfolio_url = models.URLField(blank=True, null=True)
    is_mentor = models.BooleanField(default=False)
    skills = models.ManyToManyField(Skill, related_name='alumni', blank=True)
    is_available_for_referrals = models.BooleanField(default=False)
    registered_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        verbose_name_plural = "Alumni"
    
    def __str__(self):
        return f"{self.user.email} ({self.graduation_year})"

class MentorshipArea(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.name

class MentorProfile(models.Model):
    alumni = models.OneToOneField(Alumni, on_delete=models.CASCADE, related_name='mentor_profile')
    expertise_areas = models.ManyToManyField(MentorshipArea, related_name='mentors')
    availability = models.TextField(help_text="Describe your availability for mentoring")
    experience_years = models.PositiveIntegerField(default=1)
    max_mentees = models.PositiveIntegerField(default=3)
    mentorship_style = models.TextField(help_text="Describe your mentorship style and approach")
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Mentor: {self.alumni.user.get_full_name() or self.alumni.user.email}"
    
    def current_mentee_count(self):
        return self.mentorship_relationships.filter(
            status='active'
        ).count()
    
    def is_available(self):
        return self.is_active and self.current_mentee_count() < self.max_mentees

class MentorshipRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('canceled', 'Canceled'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentorship_requests')
    mentor = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name='requests')
    message = models.TextField()
    areas_of_interest = models.ManyToManyField(MentorshipArea, related_name='mentorship_requests')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(default=timezone.now)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.email} → {self.mentor.alumni.user.email} ({self.status})"

class MentorshipRelationship(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('terminated', 'Terminated'),
    )
    
    mentor = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name='mentorship_relationships')
    mentee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentorship_relationships')
    goals = models.TextField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='active')
    started_at = models.DateTimeField(default=timezone.now)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['mentor', 'mentee']
    
    def __str__(self):
        return f"{self.mentor.alumni.user.email} mentoring {self.mentee.email}"

class MentorshipSession(models.Model):
    relationship = models.ForeignKey(MentorshipRelationship, on_delete=models.CASCADE, related_name='sessions')
    title = models.CharField(max_length=200)
    date = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField()
    topics_discussed = models.TextField()
    action_items = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"Session: {self.title} ({self.relationship})"

class AlumniEvent(models.Model):
    EVENT_TYPES = (
        ('webinar', 'Webinar'),
        ('networking', 'Networking Event'),
        ('workshop', 'Workshop'),
        ('panel', 'Panel Discussion'),
        ('hackathon', 'Hackathon'),
        ('social', 'Social Gathering'),
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_type = models.CharField(max_length=15, choices=EVENT_TYPES)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True, related_name='alumni_events')
    is_virtual = models.BooleanField(default=False)
    virtual_meeting_url = models.URLField(blank=True, null=True)
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_events')
    max_participants = models.PositiveIntegerField(null=True, blank=True)
    registration_deadline = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.title} ({self.start_datetime.strftime('%Y-%m-%d')})"
    
    def is_past(self):
        return self.end_datetime < timezone.now()
    
    def is_ongoing(self):
        now = timezone.now()
        return self.start_datetime <= now <= self.end_datetime

class EventRegistration(models.Model):
    event = models.ForeignKey(AlumniEvent, on_delete=models.CASCADE, related_name='registrations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_registrations')
    registered_at = models.DateTimeField(default=timezone.now)
    attended = models.BooleanField(default=False)
    feedback = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ['event', 'user']
    
    def __str__(self):
        return f"{self.user.email} - {self.event.title}"

class AlumniReferral(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    )
    
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referral_requests')
    alumni = models.ForeignKey(Alumni, on_delete=models.CASCADE, related_name='referral_requests')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='referral_requests')
    position = models.CharField(max_length=100)
    message = models.TextField()
    resume = models.ForeignKey('learning.Resume', on_delete=models.SET_NULL, null=True, related_name='referrals')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.requester.email} requested referral from {self.alumni.user.email} for {self.company.name}"