from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from django.conf import settings

from ..models import JobListing, JobApplication, SavedJob, JobAlert, ColdEmail
from .serializers import (
    JobListingSerializer, JobApplicationSerializer,
    SavedJobSerializer, JobAlertSerializer, ColdEmailSerializer
)
from ..services.job_apis import get_job_api_client

class JobListingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = JobListingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'company__name', 'description', 'location__name']
    ordering_fields = ['posted_at', 'title', 'company__name', 'salary_min', 'salary_max']
    ordering = ['-posted_at']
    
    def get_queryset(self):
        queryset = JobListing.objects.filter(application_status='open')
        
        # Check if we should fetch fresh data from APIs
        should_refresh = self.request.query_params.get('refresh', 'false').lower() == 'true'
        if should_refresh and settings.USE_REAL_JOB_APIS:
            try:
                # Get job API client and sync jobs
                job_api_client = get_job_api_client()
                job_api_client.sync_jobs()
            except Exception as e:
                print(f"Error refreshing jobs: {str(e)}")
        
        # Apply filters
        company_id = self.request.query_params.get('company_id')
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        
        location_id = self.request.query_params.get('location_id')
        if location_id:
            queryset = queryset.filter(location_id=location_id)
        
        is_remote = self.request.query_params.get('is_remote')
        if is_remote is not None:
            is_remote_bool = is_remote.lower() == 'true'
            queryset = queryset.filter(is_remote=is_remote_bool)
        
        employment_type_id = self.request.query_params.get('employment_type_id')
        if employment_type_id:
            queryset = queryset.filter(employment_type_id=employment_type_id)
        
        experience_max = self.request.query_params.get('experience_max')
        if experience_max:
            queryset = queryset.filter(experience_required_years__lte=int(experience_max))
        
        skill_ids = self.request.query_params.getlist('skill_id')
        if skill_ids:
            queryset = queryset.filter(required_skills__id__in=skill_ids).distinct()
        
        salary_min = self.request.query_params.get('salary_min')
        if salary_min:
            queryset = queryset.filter(salary_min__gte=float(salary_min))
        
        salary_max = self.request.query_params.get('salary_max')
        if salary_max:
            queryset = queryset.filter(salary_max__lte=float(salary_max))
        
        # Keywords search (across multiple fields)
        keywords = self.request.query_params.get('keywords')
        if keywords:
            keyword_query = Q()
            for keyword in keywords.split():
                keyword_query |= (
                    Q(title__icontains=keyword) |
                    Q(description__icontains=keyword) |
                    Q(company__name__icontains=keyword) |
                    Q(location__name__icontains=keyword)
                )
            queryset = queryset.filter(keyword_query)
        
        return queryset.select_related('company', 'location', 'employment_type')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get most recently posted jobs"""
        jobs = self.get_queryset().order_by('-posted_at')[:10]
        serializer = self.get_serializer(jobs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recommended(self, request):
        """Get recommended jobs based on user skills"""
        user = request.user
        
        # Get user's skills from their resume if available
        user_skills = set()
        for resume in user.resumes.all():
            # In a real app, you'd extract skills from the resume
            # For now, we'll use a placeholder approach
            pass
        
        # If we have user skills, filter jobs by required skills
        if user_skills:
            jobs = self.get_queryset().filter(
                required_skills__name__in=user_skills
            ).distinct().order_by('-posted_at')[:10]
        else:
            # Otherwise, just return recent jobs
            jobs = self.get_queryset().order_by('-posted_at')[:10]
        
        serializer = self.get_serializer(jobs, many=True)
        return Response(serializer.data)


class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        application = self.get_object()
        status = request.data.get('status')
        
        if not status:
            return Response(
                {'detail': 'Status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if status not in [s[0] for s in JobApplication.STATUS_CHOICES]:
            return Response(
                {'detail': f'Invalid status: {status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        application.status = status
        application.save()
        
        serializer = self.get_serializer(application)
        return Response(serializer.data)


class SavedJobViewSet(viewsets.ModelViewSet):
    serializer_class = SavedJobSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class JobAlertViewSet(viewsets.ModelViewSet):
    serializer_class = JobAlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return JobAlert.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        alert = self.get_object()
        alert.is_active = not alert.is_active
        alert.save()
        
        serializer = self.get_serializer(alert)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def matching_jobs(self, request, pk=None):
        alert = self.get_object()
        
        # Build query based on alert criteria
        query = Q(application_status='open')
        
        if alert.keywords:
            keyword_query = Q()
            for keyword in alert.keywords.split():
                keyword_query |= (
                    Q(title__icontains=keyword) |
                    Q(description__icontains=keyword)
                )
            query &= keyword_query
        
        if alert.locations.exists():
            location_ids = alert.locations.values_list('id', flat=True)
            query &= Q(location_id__in=location_ids)
        
        if alert.skills.exists():
            skill_ids = alert.skills.values_list('id', flat=True)
            query &= Q(required_skills__id__in=skill_ids)
        
        if alert.is_remote is not None:
            query &= Q(is_remote=alert.is_remote)
        
        if alert.experience_min > 0:
            query &= Q(experience_required_years__gte=alert.experience_min)
        
        if alert.experience_max < 99:  # Default max in model
            query &= Q(experience_required_years__lte=alert.experience_max)
        
        # Execute query
        matching_jobs = JobListing.objects.filter(query).distinct()
        
        # Get most recent jobs first
        matching_jobs = matching_jobs.order_by('-posted_at')[:20]
        
        serializer = JobListingSerializer(
            matching_jobs, 
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)


class ColdEmailViewSet(viewsets.ModelViewSet):
    serializer_class = ColdEmailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ColdEmail.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_as_sent(self, request, pk=None):
        cold_email = self.get_object()
        
        if cold_email.status != 'draft':
            return Response(
                {'detail': f'Email is already in {cold_email.status} status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cold_email.status = 'sent'
        cold_email.sent_at = timezone.now()
        cold_email.save()
        
        serializer = self.get_serializer(cold_email)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_received(self, request, pk=None):
        cold_email = self.get_object()
        
        if cold_email.status not in ['sent', 'draft']:
            return Response(
                {'detail': f'Email must be in sent or draft status to mark as received'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cold_email.status = 'received'
        cold_email.save()
        
        serializer = self.get_serializer(cold_email)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_replied(self, request, pk=None):
        cold_email = self.get_object()
        
        if cold_email.status not in ['sent', 'received']:
            return Response(
                {'detail': f'Email must be in sent or received status to mark as replied'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cold_email.status = 'replied'
        cold_email.save()
        
        serializer = self.get_serializer(cold_email)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def record_follow_up(self, request, pk=None):
        cold_email = self.get_object()
        notes = request.data.get('notes')
        
        if not notes:
            return Response(
                {'detail': 'Follow-up notes are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Append to existing notes or create new
        if cold_email.notes:
            cold_email.notes += f"\n\n--- Follow-up ({timezone.now().strftime('%Y-%m-%d %H:%M')}) ---\n{notes}"
        else:
            cold_email.notes = f"--- Follow-up ({timezone.now().strftime('%Y-%m-%d %H:%M')}) ---\n{notes}"
        
        cold_email.last_follow_up = timezone.now()
        cold_email.save()
        
        serializer = self.get_serializer(cold_email)
        return Response(serializer.data)