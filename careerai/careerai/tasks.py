import logging
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from celery import shared_task

from job_search.services.job_apis import get_job_api_client
from course.services.course_apis import get_course_api_client
from job_search.models import JobAlert
from user_registration.models import User

logger = logging.getLogger(__name__)

@shared_task
def sync_jobs_task():
    """Sync jobs from external APIs"""
    if not settings.USE_REAL_JOB_APIS:
        logger.info("Skipping job sync (mock mode)")
        return "Skipped job sync (mock mode)"
    
    logger.info("Starting scheduled job sync task")
    total_synced = 0
    
    try:
        # Sync jobs from all configured sources
        for source in ['indeed', 'linkedin']:
            job_api_client = get_job_api_client(source)
            synced_count = job_api_client.sync_jobs()
            logger.info(f"Synced {synced_count} jobs from {source}")
            total_synced += synced_count
        
        return f"Successfully synced {total_synced} jobs"
    except Exception as e:
        logger.error(f"Error in job sync task: {str(e)}")
        raise

@shared_task
def sync_courses_task():
    """Sync courses from external APIs"""
    if not settings.USE_REAL_COURSE_APIS:
        logger.info("Skipping course sync (mock mode)")
        return "Skipped course sync (mock mode)"
    
    logger.info("Starting scheduled course sync task")
    total_synced = 0
    
    try:
        # Sync courses from all configured sources
        for source in ['udemy', 'coursera']:
            course_api_client = get_course_api_client(source)
            synced_count = course_api_client.sync_courses()
            logger.info(f"Synced {synced_count} courses from {source}")
            total_synced += synced_count
        
        return f"Successfully synced {total_synced} courses"
    except Exception as e:
        logger.error(f"Error in course sync task: {str(e)}")
        raise

@shared_task
def process_job_alerts():
    """Process job alerts and send notifications"""
    from django.core.mail import send_mail
    from job_search.models import JobListing, JobAlert
    
    logger.info("Processing job alerts")
    
    # Get active alerts that are due to be processed
    alerts = JobAlert.objects.filter(is_active=True)
    alerts_processed = 0
    
    for alert in alerts:
        try:
            # Check if it's time to process this alert based on frequency
            if alert.last_sent_at:
                if alert.frequency == 'daily' and (timezone.now() - alert.last_sent_at).days < 1:
                    continue
                elif alert.frequency == 'weekly' and (timezone.now() - alert.last_sent_at).days < 7:
                    continue
                elif alert.frequency == 'biweekly' and (timezone.now() - alert.last_sent_at).days < 14:
                    continue
                elif alert.frequency == 'monthly' and (timezone.now() - alert.last_sent_at).days < 30:
                    continue
            
            # Find matching jobs
            matching_jobs = JobListing.objects.filter(application_status='open', posted_at__gte=timezone.now() - timedelta(days=7))
            
            # Apply alert criteria
            if alert.keywords:
                matching_jobs = matching_jobs.filter(title__icontains=alert.keywords)
            
            if alert.locations.exists():
                matching_jobs = matching_jobs.filter(location__in=alert.locations.all())
            
            if alert.skills.exists():
                matching_jobs = matching_jobs.filter(required_skills__in=alert.skills.all()).distinct()
            
            if alert.is_remote is not None:
                matching_jobs = matching_jobs.filter(is_remote=alert.is_remote)
            
            if matching_jobs.exists():
                # In a real app, send an email with the matching jobs
                # For now, just log it
                logger.info(f"Alert {alert.id} for user {alert.user.email} matched {matching_jobs.count()} jobs")
                
                # Update last sent timestamp
                alert.last_sent_at = timezone.now()
                alert.save()
            
            alerts_processed += 1
        except Exception as e:
            logger.error(f"Error processing job alert {alert.id}: {str(e)}")
    
    return f"Processed {alerts_processed} job alerts"