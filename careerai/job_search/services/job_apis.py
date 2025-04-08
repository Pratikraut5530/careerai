import os
import json
import requests
import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Q
from django.conf import settings

from job_search.models import JobListing, Company, Location, EmploymentType, Skill

logger = logging.getLogger(__name__)

class JobAPIClient:
    """Base class for job search API clients"""
    def get_jobs(self, params=None):
        """Method to be implemented by subclasses"""
        raise NotImplementedError("Subclasses must implement get_jobs method")
    
    def sync_jobs(self):
        """Method to be implemented by subclasses"""
        raise NotImplementedError("Subclasses must implement sync_jobs method")


class IndeedAPIClient(JobAPIClient):
    """Client for Indeed Job Search API"""
    
    def __init__(self):
        self.publisher_id = settings.INDEED_PUBLISHER_ID
        self.base_url = "https://api.indeed.com/ads/apisearch"
    
    def get_jobs(self, params=None):
        """
        Fetch jobs from Indeed API
        
        Args:
            params (dict): Search parameters
        
        Returns:
            list: List of job data
        """
        default_params = {
            'publisher': self.publisher_id,
            'format': 'json',
            'v': '2',
            'limit': 25,
            'fromage': 14,  # Jobs from the last 14 days
            'highlight': 0,
        }
        
        if params:
            default_params.update(params)
        
        try:
            response = requests.get(self.base_url, params=default_params)
            response.raise_for_status()
            return response.json().get('results', [])
        except requests.RequestException as e:
            logger.error(f"Indeed API error: {str(e)}")
            return []
    
    def sync_jobs(self, job_data=None):
        """
        Sync jobs from Indeed API to database
        
        Args:
            job_data (list): Optional list of job data to sync
                            If not provided, will fetch from API
        
        Returns:
            int: Number of jobs synced
        """
        if job_data is None:
            job_data = self.get_jobs()
        
        synced_count = 0
        
        for job in job_data:
            # Convert Indeed job to our model format
            try:
                # Get or create company
                company, _ = Company.objects.get_or_create(
                    name=job.get('company', 'Unknown Company')
                )
                
                # Get or create location
                location, _ = Location.objects.get_or_create(
                    name=f"{job.get('city', '')}, {job.get('state', '')}"
                )
                
                # Get default employment type
                employment_type, _ = EmploymentType.objects.get_or_create(
                    name='Full-time'  # Default, can be refined with more data
                )
                
                # Parse salary if available
                salary_min = None
                salary_max = None
                if job.get('salary'):
                    salary_text = job.get('salary')
                    # Simple salary range extraction, can be refined
                    if '-' in salary_text:
                        salary_parts = salary_text.replace('$', '').replace(',', '').split('-')
                        try:
                            salary_min = float(salary_parts[0].strip())
                            salary_max = float(salary_parts[1].strip())
                        except (ValueError, IndexError):
                            pass
                
                # Create or update job listing
                job_listing, created = JobListing.objects.update_or_create(
                    title=job.get('jobtitle', 'Unknown Title'),
                    company=company,
                    defaults={
                        'description': job.get('snippet', ''),
                        'requirements': job.get('snippet', ''),  # Default to snippet if no specific requirements
                        'responsibilities': '',  # Default empty, would need more data
                        'location': location,
                        'employment_type': employment_type,
                        'is_remote': 'remote' in job.get('jobtitle', '').lower() or 'remote' in job.get('snippet', '').lower(),
                        'salary_min': salary_min,
                        'salary_max': salary_max,
                        'apply_url': job.get('url', ''),
                        'posted_at': datetime.now() - timedelta(days=int(job.get('formattedRelativeTime', '0').split()[0]) if job.get('formattedRelativeTime') else 0),
                    }
                )
                
                # Extract and add skills (simple keyword matching, can be refined)
                if created or job_listing:
                    skill_keywords = ['python', 'javascript', 'react', 'django', 'sql', 'java', 'aws', 'docker']
                    for keyword in skill_keywords:
                        if keyword in job.get('snippet', '').lower() or keyword in job.get('jobtitle', '').lower():
                            skill, _ = Skill.objects.get_or_create(name=keyword.title())
                            job_listing.required_skills.add(skill)
                
                synced_count += 1
            
            except Exception as e:
                logger.error(f"Error syncing job {job.get('jobtitle', 'Unknown')}: {str(e)}")
                continue
        
        return synced_count


class LinkedInJobsClient(JobAPIClient):
    """Client for LinkedIn Jobs API"""
    
    def __init__(self):
        self.api_key = settings.LINKEDIN_API_KEY
        self.base_url = "https://api.linkedin.com/v2/jobSearch"
    
    def get_jobs(self, params=None):
        """
        Fetch jobs from LinkedIn API
        
        Args:
            params (dict): Search parameters
        
        Returns:
            list: List of job data
        """
        default_params = {
            'count': 25,
            'start': 0,
        }
        
        if params:
            default_params.update(params)
        
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Accept': 'application/json'
        }
        
        try:
            response = requests.get(self.base_url, params=default_params, headers=headers)
            response.raise_for_status()
            return response.json().get('elements', [])
        except requests.RequestException as e:
            logger.error(f"LinkedIn API error: {str(e)}")
            return []
    
    def sync_jobs(self, job_data=None):
        """Sync jobs from LinkedIn API to database"""
        if job_data is None:
            job_data = self.get_jobs()
        
        synced_count = 0
        
        for job in job_data:
            try:
                # Extract company
                company_name = job.get('companyDetails', {}).get('name', 'Unknown Company')
                company, _ = Company.objects.get_or_create(name=company_name)
                
                # Extract location
                location_name = job.get('locationName', 'Unknown Location')
                location, _ = Location.objects.get_or_create(name=location_name)
                
                # Extract employment type
                employment_type_name = 'Full-time'  # Default
                if job.get('employmentStatus', {}).get('name'):
                    employment_type_name = job.get('employmentStatus', {}).get('name')
                
                employment_type, _ = EmploymentType.objects.get_or_create(name=employment_type_name)
                
                # Create or update job listing
                job_listing, created = JobListing.objects.update_or_create(
                    title=job.get('title', 'Unknown Title'),
                    company=company,
                    defaults={
                        'description': job.get('description', ''),
                        'requirements': job.get('description', ''),  # LinkedIn API may not separate these
                        'responsibilities': job.get('description', ''),  # LinkedIn API may not separate these
                        'location': location,
                        'employment_type': employment_type,
                        'is_remote': 'remote' in job.get('title', '').lower() or 'remote' in job.get('description', '').lower(),
                        'apply_url': job.get('applyUrl', ''),
                        'posted_at': datetime.fromisoformat(job.get('postingDate')) if job.get('postingDate') else timezone.now(),
                    }
                )
                
                # Extract and add skills from job description
                if created or job_listing:
                    skill_keywords = ['python', 'javascript', 'react', 'django', 'sql', 'java', 'aws', 'docker']
                    for keyword in skill_keywords:
                        if keyword in job.get('description', '').lower() or keyword in job.get('title', '').lower():
                            skill, _ = Skill.objects.get_or_create(name=keyword.title())
                            job_listing.required_skills.add(skill)
                
                synced_count += 1
            
            except Exception as e:
                logger.error(f"Error syncing LinkedIn job {job.get('title', 'Unknown')}: {str(e)}")
                continue
        
        return synced_count


class WorkdayAPIClient(JobAPIClient):
    """Client for Workday API"""
    
    def __init__(self):
        self.api_key = settings.WORKDAY_API_KEY
        self.tenant_id = settings.WORKDAY_TENANT_ID
        self.base_url = f"https://api.workday.com/tenants/{self.tenant_id}/job-postings/v1"
    
    def get_jobs(self, params=None):
        """Fetch jobs from Workday API"""
        default_params = {
            'limit': 25,
            'offset': 0,
            'active': True
        }
        
        if params:
            default_params.update(params)
            
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Accept': 'application/json'
        }
        
        try:
            response = requests.get(self.base_url, params=default_params, headers=headers)
            response.raise_for_status()
            return response.json().get('data', [])
        except requests.RequestException as e:
            logger.error(f"Workday API error: {str(e)}")
            return []
    
    def sync_jobs(self, job_data=None):
        """Sync jobs from Workday API to database"""
        if job_data is None:
            job_data = self.get_jobs()
        
        synced_count = 0
        
        for job in job_data:
            try:
                # Convert Workday job to our model format
                company_name = job.get('company', {}).get('name', 'Unknown Company')
                company, _ = Company.objects.get_or_create(name=company_name)
                
                location_name = f"{job.get('location', {}).get('city', '')}, {job.get('location', {}).get('country', '')}"
                location, _ = Location.objects.get_or_create(name=location_name)
                
                employment_type_name = job.get('employmentType', 'Full-time')
                employment_type, _ = EmploymentType.objects.get_or_create(name=employment_type_name)
                
                # Create or update job listing
                job_listing, created = JobListing.objects.update_or_create(
                    title=job.get('title', 'Unknown Title'),
                    company=company,
                    defaults={
                        'description': job.get('description', ''),
                        'requirements': job.get('qualifications', ''),
                        'responsibilities': job.get('responsibilities', ''),
                        'location': location,
                        'employment_type': employment_type,
                        'is_remote': 'remote' in job.get('title', '').lower() or 'remote' in job.get('description', '').lower(),
                        'salary_min': job.get('compensation', {}).get('min'),
                        'salary_max': job.get('compensation', {}).get('max'),
                        'apply_url': job.get('applyUrl', ''),
                        'posted_at': datetime.fromisoformat(job.get('postDate')) if job.get('postDate') else timezone.now(),
                    }
                )
                
                # Add required skills
                if 'skills' in job and job['skills']:
                    for skill_name in job['skills']:
                        skill, _ = Skill.objects.get_or_create(name=skill_name)
                        job_listing.required_skills.add(skill)
                
                synced_count += 1
            
            except Exception as e:
                logger.error(f"Error syncing Workday job: {str(e)}")
                continue
        
        return synced_count


# Mock job data provider for development/testing
class MockJobAPIClient(JobAPIClient):
    """Mock client for testing when real APIs are not available"""
    
    def get_jobs(self, params=None):
        """Return mock job data"""
        mock_jobs = [
            {
                'jobtitle': 'Senior Python Developer',
                'company': 'Tech Innovations',
                'city': 'San Francisco',
                'state': 'CA',
                'snippet': 'Experienced Python developer needed for backend development. Skills: Python, Django, PostgreSQL, AWS, Docker. 5+ years experience required.',
                'url': 'https://example.com/jobs/1',
                'formattedRelativeTime': '1 day ago',
                'salary': '$120,000 - $150,000'
            },
            {
                'jobtitle': 'Frontend React Developer',
                'company': 'UX Solutions',
                'city': 'New York',
                'state': 'NY',
                'snippet': 'Building modern user interfaces with React. Skills: JavaScript, React, HTML5, CSS3, TypeScript. 3+ years experience with React.',
                'url': 'https://example.com/jobs/2',
                'formattedRelativeTime': '2 days ago',
                'salary': '$100,000 - $130,000'
            },
            {
                'jobtitle': 'DevOps Engineer (Remote)',
                'company': 'Cloud Systems Inc',
                'city': 'Remote',
                'state': 'US',
                'snippet': 'Managing cloud infrastructure and CI/CD pipelines. Skills: AWS, Kubernetes, Terraform, Docker, Jenkins. Remote position available.',
                'url': 'https://example.com/jobs/3',
                'formattedRelativeTime': '5 days ago',
                'salary': '$110,000 - $140,000'
            },
            {
                'jobtitle': 'Full Stack Developer',
                'company': 'Startup Hub',
                'city': 'Austin',
                'state': 'TX',
                'snippet': 'Building features across the entire stack. Skills: JavaScript, Node.js, React, MongoDB, Express. Fast-paced startup environment.',
                'url': 'https://example.com/jobs/4',
                'formattedRelativeTime': '3 days ago',
                'salary': '$90,000 - $120,000'
            },
            {
                'jobtitle': 'Machine Learning Engineer',
                'company': 'AI Research Lab',
                'city': 'Seattle',
                'state': 'WA',
                'snippet': 'Developing machine learning models for production. Skills: Python, TensorFlow, PyTorch, scikit-learn, NLP. PhD or equivalent experience preferred.',
                'url': 'https://example.com/jobs/5',
                'formattedRelativeTime': '1 day ago',
                'salary': '$130,000 - $160,000'
            }
        ]
        return mock_jobs
    
    def sync_jobs(self, job_data=None):
        """Sync mock jobs to database"""
        # Use the IndeedAPIClient's sync_jobs method to process our mock data
        indeed_client = IndeedAPIClient()
        return indeed_client.sync_jobs(self.get_jobs())


# API Client factory
def get_job_api_client(source='indeed'):
    """
    Factory function to get the appropriate job API client
    
    Args:
        source (str): API source (indeed, linkedin, etc.)
    
    Returns:
        JobAPIClient: Instance of a JobAPIClient subclass
    """
    # If we're not using real APIs, return the mock client
    if not settings.USE_REAL_JOB_APIS:
        return MockJobAPIClient()
    
    # Otherwise, return the requested API client
    if source.lower() == 'indeed':
        return IndeedAPIClient()
    elif source.lower() == 'linkedin':
        return LinkedInJobsClient()
    elif source.lower() == 'workday':
        return WorkdayAPIClient()
    else:
        raise ValueError(f"Unsupported job API source: {source}")