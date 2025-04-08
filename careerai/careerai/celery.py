import os
from celery import Celery
from django.conf import settings

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'careerai.settings')

app = Celery('careerai')

# Use settings from Django
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load tasks from all registered Django app configs
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')

# Define periodic tasks
app.conf.beat_schedule = {
    'sync-jobs-periodically': {
        'task': 'careerai.tasks.sync_jobs_task',
        'schedule': 60 * 60 * settings.JOB_SYNC_INTERVAL_HOURS,  # Run every N hours
    },
    'sync-courses-periodically': {
        'task': 'careerai.tasks.sync_courses_task',
        'schedule': 60 * 60 * settings.COURSE_SYNC_INTERVAL_HOURS,  # Run every N hours
    },
    'process-job-alerts': {
        'task': 'careerai.tasks.process_job_alerts',
        'schedule': 60 * 60,  # Run hourly
    },
}