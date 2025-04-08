import os
import logging
import requests
from django.conf import settings
from datetime import datetime
from course.models import Course, CourseCategory, Module, Lesson

logger = logging.getLogger(__name__)

class CourseAPIClient:
    """Base class for course API clients"""
    def get_courses(self, params=None):
        """Method to be implemented by subclasses"""
        raise NotImplementedError("Subclasses must implement get_courses method")
    
    def sync_courses(self):
        """Method to be implemented by subclasses"""
        raise NotImplementedError("Subclasses must implement sync_courses method")


class UdemyAPIClient(CourseAPIClient):
    """Client for Udemy Course API"""
    
    def __init__(self):
        self.client_id = settings.UDEMY_CLIENT_ID
        self.client_secret = settings.UDEMY_CLIENT_SECRET
        self.base_url = "https://www.udemy.com/api-2.0/courses/"
    
    def get_courses(self, params=None):
        """
        Fetch courses from Udemy API
        
        Args:
            params (dict): Search parameters
        
        Returns:
            list: List of course data
        """
        default_params = {
            'page': 1,
            'page_size': 20,
            'fields[course]': 'title,headline,description,url,image_480x270,price,instructional_level,visible_instructors',
        }
        
        if params:
            default_params.update(params)
        
        headers = {
            'Authorization': f'Basic {self.client_id}:{self.client_secret}',
            'Accept': 'application/json, text/plain, */*'
        }
        
        try:
            response = requests.get(self.base_url, params=default_params, headers=headers)
            response.raise_for_status()
            return response.json().get('results', [])
        except requests.RequestException as e:
            logger.error(f"Udemy API error: {str(e)}")
            return []
    
    def sync_courses(self, course_data=None):
        """
        Sync courses from Udemy API to database
        
        Args:
            course_data (list): Optional list of course data to sync
                              If not provided, will fetch from API
        
        Returns:
            int: Number of courses synced
        """
        if course_data is None:
            course_data = self.get_courses()
        
        synced_count = 0
        
        for course in course_data:
            try:
                # Determine difficulty level
                level_map = {
                    'all levels': 'beginner',
                    'beginner level': 'beginner',
                    'intermediate level': 'intermediate',
                    'expert level': 'advanced'
                }
                difficulty_level = level_map.get(course.get('instructional_level', '').lower(), 'beginner')
                
                # Get or create course category
                category_name = course.get('primary_category', {}).get('title', 'Uncategorized')
                category, _ = CourseCategory.objects.get_or_create(name=category_name)
                
                # Get instructor name
                instructors = course.get('visible_instructors', [])
                instructor_name = instructors[0].get('title', 'Unknown Instructor') if instructors else 'Unknown Instructor'
                
                # Calculate duration in weeks (approximately)
                content_length = course.get('content_length_video_in_seconds', 0)
                # Assuming 5 hours of content per week
                duration_in_weeks = max(1, round(content_length / (5 * 3600)))
                
                # Create or update course
                course_obj, created = Course.objects.update_or_create(
                    title=course.get('title', 'Unknown Course'),
                    defaults={
                        'description': course.get('description', ''),
                        'category': category,
                        'difficulty_level': difficulty_level,
                        'duration_in_weeks': duration_in_weeks,
                        'instructor_name': instructor_name,
                        'thumbnail': course.get('image_480x270', ''),
                        'is_active': True,
                    }
                )
                
                # Add basic modules and lessons if this is a new course
                if created:
                    self._create_default_modules_and_lessons(course_obj, course)
                
                synced_count += 1
            
            except Exception as e:
                logger.error(f"Error syncing course {course.get('title', 'Unknown')}: {str(e)}")
                continue
        
        return synced_count
    
    def _create_default_modules_and_lessons(self, course_obj, api_course_data):
        """
        Create default modules and lessons for a new course
        
        Args:
            course_obj: The Course model instance
            api_course_data: Original API data for the course
        """
        # Create a default module
        module = Module.objects.create(
            course=course_obj,
            title='Introduction',
            description='Introduction to the course',
            order=1
        )
        
        # Create a sample lesson
        Lesson.objects.create(
            module=module,
            title='Getting Started',
            content_type='video',
            content='Introduction to the course concepts',
            order=1,
            estimated_time_minutes=15
        )
        
        # If we have curriculum data, try to create more accurate modules
        if api_course_data.get('curriculum', []):
            self._create_curriculum_from_api_data(course_obj, api_course_data)


class CourseraAPIClient(CourseAPIClient):
    """Client for Coursera API"""
    
    def __init__(self):
        self.api_key = settings.COURSERA_API_KEY
        self.base_url = "https://api.coursera.org/api/courses.v1"
    
    def get_courses(self, params=None):
        """
        Fetch courses from Coursera API
        
        Args:
            params (dict): Search parameters
        
        Returns:
            list: List of course data
        """
        default_params = {
            'fields': 'name,slug,description,photoUrl,instructorIds,partnerIds,specializations,primaryLanguages,s12nIds,domainTypes',
            'includes': 'instructorIds,partnerIds,s12nIds,domainTypes',
            'limit': 20,
            'q': 'search',
            'start': 0
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
            logger.error(f"Coursera API error: {str(e)}")
            return []
    
    def sync_courses(self, course_data=None):
        """Sync courses from Coursera API to database"""
        if course_data is None:
            course_data = self.get_courses()
        
        synced_count = 0
        
        for course in course_data:
            try:
                # Map difficulty level
                difficulty_mapping = {
                    'beginner': 'beginner',
                    'intermediate': 'intermediate',
                    'advanced': 'advanced'
                }
                difficulty_level = difficulty_mapping.get(course.get('difficulty', '').lower(), 'beginner')
                
                # Get or create category
                category_name = course.get('domainTypes', [{'subdomainId': 'Uncategorized'}])[0].get('subdomainId', 'Uncategorized')
                category, _ = CourseCategory.objects.get_or_create(name=category_name)
                
                # Calculate duration in weeks based on estimated hours
                estimated_hours = course.get('estimatedWorkload', '4-6 hours/week')
                # Extract hours per week from string like "4-6 hours/week"
                try:
                    hours_range = estimated_hours.split(' ')[0]
                    avg_hours = sum(map(float, hours_range.split('-'))) / 2
                    # Assume 5 hours per week per 1 week duration
                    duration_in_weeks = max(1, int(avg_hours / 5))
                except:
                    duration_in_weeks = 4  # Default to 4 weeks
                
                # Get instructor name
                instructor_name = "Coursera Instructor"
                if course.get('instructors'):
                    instructor_names = [inst.get('fullName', '') for inst in course.get('instructors', [])]
                    instructor_name = ', '.join(filter(None, instructor_names)) or instructor_name
                
                # Create or update course
                course_obj, created = Course.objects.update_or_create(
                    title=course.get('name', 'Unknown Course'),
                    defaults={
                        'description': course.get('description', ''),
                        'category': category,
                        'difficulty_level': difficulty_level,
                        'duration_in_weeks': duration_in_weeks,
                        'instructor_name': instructor_name,
                        'thumbnail': course.get('photoUrl', ''),
                        'is_active': True,
                    }
                )
                
                # Add modules and lessons if it's a new course
                if created:
                    self._create_modules_from_coursera_data(course_obj, course)
                
                synced_count += 1
            
            except Exception as e:
                logger.error(f"Error syncing Coursera course {course.get('name', 'Unknown')}: {str(e)}")
                continue
        
        return synced_count
    
    def _create_modules_from_coursera_data(self, course_obj, api_course_data):
        """
        Create modules and lessons from Coursera API data
        
        Args:
            course_obj: The Course model instance
            api_course_data: Original API data for the course
        """
        # Create a default module
        module = Module.objects.create(
            course=course_obj,
            title='Introduction',
            description='Introduction to the course',
            order=1
        )
        
        # Create a sample lesson
        Lesson.objects.create(
            module=module,
            title='Getting Started',
            content_type='video',
            content='Introduction to the course concepts',
            order=1,
            estimated_time_minutes=15
        )
        
        # If we have week/module data, create more accurate modules
        weeks = api_course_data.get('weeks', [])
        if weeks:
            for i, week in enumerate(weeks, start=2):  # Start from 2 because we already have module 1
                week_module = Module.objects.create(
                    course=course_obj,
                    title=f"Week {i-1}: {week.get('title', 'Course Content')}",
                    description=week.get('description', ''),
                    order=i
                )
                
                # Create lessons for each week
                for j, lesson_data in enumerate(week.get('lessons', []), start=1):
                    Lesson.objects.create(
                        module=week_module,
                        title=lesson_data.get('title', f'Lesson {j}'),
                        content_type='video',  # Default type
                        content=lesson_data.get('description', ''),
                        order=j,
                        estimated_time_minutes=30  # Default time
                    )


# Mock course data provider for development/testing
class MockCourseAPIClient(CourseAPIClient):
    """Mock client for testing when real APIs are not available"""
    
    def get_courses(self, params=None):
        """Return mock course data"""
        mock_courses = [
            {
                'title': 'Python for Data Science',
                'description': 'Learn Python programming for data analysis and visualization. Covers NumPy, Pandas, Matplotlib, and more.',
                'primary_category': {'title': 'Data Science'},
                'instructional_level': 'beginner level',
                'visible_instructors': [{'title': 'Dr. Sarah Johnson'}],
                'content_length_video_in_seconds': 36000,  # 10 hours
                'image_480x270': 'https://example.com/course1.jpg'
            },
            {
                'title': 'Advanced Web Development with React',
                'description': 'Master React and Redux for building modern web applications. Includes hooks, context API, and server-side rendering.',
                'primary_category': {'title': 'Web Development'},
                'instructional_level': 'intermediate level',
                'visible_instructors': [{'title': 'Michael Chen'}],
                'content_length_video_in_seconds': 54000,  # 15 hours
                'image_480x270': 'https://example.com/course2.jpg'
            },
            {
                'title': 'Machine Learning Fundamentals',
                'description': 'Introduction to machine learning algorithms and techniques. Covers supervised and unsupervised learning with practical examples.',
                'primary_category': {'title': 'Machine Learning'},
                'instructional_level': 'beginner level',
                'visible_instructors': [{'title': 'Prof. Alex Williams'}],
                'content_length_video_in_seconds': 43200,  # 12 hours
                'image_480x270': 'https://example.com/course3.jpg'
            },
            {
                'title': 'Cloud Architecture on AWS',
                'description': 'Design and implement scalable cloud solutions using Amazon Web Services. Covers EC2, S3, Lambda, and more.',
                'primary_category': {'title': 'Cloud Computing'},
                'instructional_level': 'intermediate level',
                'visible_instructors': [{'title': 'James Wilson'}],
                'content_length_video_in_seconds': 64800,  # 18 hours
                'image_480x270': 'https://example.com/course4.jpg'
            },
            {
                'title': 'iOS App Development with Swift',
                'description': 'Build iOS applications from scratch using Swift. Learn UI design, Core Data, networking, and App Store submission.',
                'primary_category': {'title': 'Mobile Development'},
                'instructional_level': 'beginner level',
                'visible_instructors': [{'title': 'Emma Rodriguez'}],
                'content_length_video_in_seconds': 50400,  # 14 hours
                'image_480x270': 'https://example.com/course5.jpg'
            }
        ]
        return mock_courses
    
    def sync_courses(self, course_data=None):
        """Sync mock courses to database"""
        # Use the UdemyAPIClient's sync_courses method to process our mock data
        udemy_client = UdemyAPIClient()
        return udemy_client.sync_courses(self.get_courses())


# API Client factory
def get_course_api_client(source='udemy'):
    """
    Factory function to get the appropriate course API client
    
    Args:
        source (str): API source (udemy, coursera, etc.)
    
    Returns:
        CourseAPIClient: Instance of a CourseAPIClient subclass
    """
    # If we're not using real APIs, return the mock client
    if not settings.USE_REAL_COURSE_APIS:
        return MockCourseAPIClient()
    
    if source.lower() == 'udemy':
        return UdemyAPIClient()
    elif source.lower() == 'coursera':
        return CourseraAPIClient()
    else:
        raise ValueError(f"Unsupported course API source: {source}")