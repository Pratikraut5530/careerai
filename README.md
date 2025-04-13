# Career AI Platform

A comprehensive career development platform built with Django REST Framework.

## Overview

Career AI is a platform designed to help users advance their careers through personalized learning paths, job search assistance, alumni networking, and mentorship opportunities. The platform leverages AI to provide tailored recommendations for courses, jobs, and learning resources.

## Features

### User Management
- Email-based authentication with JWT tokens
- Profile management with career details
- Email verification and password reset
- User preferences and settings

### Course Management
- Course catalog with filtering and search
- Course enrollment and progress tracking
- Course recommendations based on user skills and interests
- Integration with external course providers (Udemy, Coursera)

### Job Search
- Job listings with advanced filtering and search
- Job applications and tracking
- Resume management and analysis
- Job alerts based on user preferences
- Cold email management for networking

### Learning Paths
- Personalized learning paths based on career goals
- Progress tracking and completion monitoring
- Notes and resource management

### Alumni Network
- Alumni directory and profiles
- Mentorship programs
- Alumni events
- Referral requests

## Technical Stack

- **Backend**: Django, Django REST Framework
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT (JSON Web Tokens)
- **Task Queue**: Celery with Redis
- **API Integration**: Udemy, Coursera, Indeed, LinkedIn Jobs

## Getting Started

### Prerequisites

- Python 3.9+
- pip
- virtualenv (recommended)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/careerai.git
   cd careerai
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up the database:
   ```
   python manage.py migrate
   ```

5. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

6. Run the development server:
   ```
   python manage.py runserver
   ```

7. Access the admin interface at http://127.0.0.1:8000/admin/

### Environment Variables

Create a `.env` file in the project root with the following variables:

```
# Django Settings
SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost

# Database Settings (for PostgreSQL)
DATABASE_URL=postgres://user:password@localhost/careerai

# API Keys
INDEED_PUBLISHER_ID=your_indeed_id
LINKEDIN_API_KEY=your_linkedin_key
UDEMY_CLIENT_ID=your_udemy_id
UDEMY_CLIENT_SECRET=your_udemy_secret
COURSERA_API_KEY=your_coursera_key

# API Settings
USE_REAL_JOB_APIS=False
JOB_SYNC_INTERVAL_HOURS=1
USE_REAL_COURSE_APIS=False
COURSE_SYNC_INTERVAL_HOURS=1

# Email Settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
```

## API Documentation

### Authentication

```
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/logout/
POST /api/auth/request_password_reset/
POST /api/auth/confirm_password_reset/
POST /api/auth/verify_email/
POST /api/token/refresh/
```

### User Management

```
GET /api/users/me/
PUT /api/users/update_profile/
POST /api/users/change_password/
GET /api/user-skills/
POST /api/user-skills/
GET /api/preferences/my_preferences/
PUT /api/preferences/update_preferences/
```

### Course Management

```
GET /api/courses/
GET /api/courses/{id}/
POST /api/courses/{id}/enroll/
POST /api/courses/{id}/review/
GET /api/courses/popular/
GET /api/courses/top_rated/
GET /api/courses/recommended/
GET /api/enrollments/
GET /api/enrollments/{id}/progress/
```

### Job Search

```
GET /api/jobs/
GET /api/jobs/{id}/
GET /api/jobs/recent/
GET /api/jobs/recommended/
POST /api/applications/
GET /api/applications/
PUT /api/applications/{id}/update_status/
GET /api/saved-jobs/
POST /api/saved-jobs/
GET /api/job-alerts/
POST /api/job-alerts/
GET /api/job-alerts/{id}/matching_jobs/
```

### Learning Management

```
GET /api/resumes/
POST /api/resumes/
POST /api/resumes/{id}/submit_for_review/
GET /api/resumes/{id}/analysis/
GET /api/learning-paths/
POST /api/learning-paths/
POST /api/learning-paths/{id}/generate_path/
GET /api/learning-paths/{id}/progress/
```

### Alumni Network

```
GET /api/alumni/
GET /api/alumni/me/
GET /api/alumni/mentors/
GET /api/mentor-profiles/
POST /api/mentorship-requests/
POST /api/mentorship-requests/{id}/accept/
GET /api/events/
POST /api/events/{id}/register/
```

## Project Structure

```
careerai/
├── careerai/                # Project settings and configuration
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   ├── asgi.py
│   ├── celery.py
├── user_registration/       # User management app
├── course/                  # Course management app
├── job_search/              # Job search app
├── learning/                # Learning management app
├── alumni/                  # Alumni network app
├── manage.py
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.