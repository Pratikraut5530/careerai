// import axios from 'axios';
// import { API_URL } from '../config';
import { getImageUrl } from '../utils/imageUtils';

// Mock data for courses
const mockCourses = [
  {
    id: 1,
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of web development including HTML, CSS and JavaScript.',
    category_name: 'Web Development',
    difficulty_level: 'beginner',
    duration_in_weeks: 6,
    instructor_name: 'John Doe',
    thumbnail: getImageUrl('course', 'Web Development'),
    average_rating: 4.5,
    total_reviews: 120,
    is_enrolled: false
  },
  {
    id: 2,
    title: 'Data Science Fundamentals',
    description: 'Introduction to data science concepts, tools and methodologies.',
    category_name: 'Data Science',
    difficulty_level: 'intermediate',
    duration_in_weeks: 8,
    instructor_name: 'Jane Smith',
    thumbnail: getImageUrl('course', 'Data Science'),
    average_rating: 4.2,
    total_reviews: 85,
    is_enrolled: false
  },
  {
    id: 3,
    title: 'Machine Learning Basics',
    description: 'Learn the fundamentals of machine learning algorithms and applications.',
    category_name: 'Machine Learning',
    difficulty_level: 'intermediate',
    duration_in_weeks: 10,
    instructor_name: 'Alex Johnson',
    thumbnail: getImageUrl('course', 'Machine Learning'),
    average_rating: 4.8,
    total_reviews: 95,
    is_enrolled: false
  },
  {
    id: 4,
    title: 'Python for Beginners',
    description: 'Start your programming journey with Python, one of the most popular languages.',
    category_name: 'Programming',
    difficulty_level: 'beginner',
    duration_in_weeks: 4,
    instructor_name: 'Michael Brown',
    thumbnail: getImageUrl('course', 'Programming'),
    average_rating: 4.7,
    total_reviews: 150,
    is_enrolled: false
  }
];

// Update mockEnrollments
const mockEnrollments = [
  {
    id: 1,
    course: {
      id: 1,
      title: 'Introduction to Web Development',
      thumbnail: getImageUrl('course', 'Web Development'),
    },
    course_title: 'Introduction to Web Development',
    enrolled_at: '2025-01-15T12:00:00Z',
    completed: false,
    progress_percentage: 45
  },
  {
    id: 2,
    course: {
      id: 2,
      title: 'Data Science Fundamentals',
      thumbnail: getImageUrl('course', 'Data Science'),
    },
    course_title: 'Data Science Fundamentals',
    enrolled_at: '2025-02-10T15:30:00Z',
    completed: false,
    progress_percentage: 25
  }
];

// Mock course categories
const mockCategories = [
  { id: 1, name: 'Web Development' },
  { id: 2, name: 'Data Science' },
  { id: 3, name: 'Machine Learning' },
  { id: 4, name: 'Programming' },
  { id: 5, name: 'Mobile Development' },
  { id: 6, name: 'DevOps' }
];

// Get all courses with optional filters
export const getCourses = async (params = {}) => {
  // Always return mock data for presentation
  return mockCourses;
};

// Get a specific course by ID
export const getCourseById = async (courseId) => {
  // Find the course in mock data
  const course = mockCourses.find(c => c.id === parseInt(courseId));
  
  if (!course) {
    throw new Error(`Course with ID ${courseId} not found`);
  }
  
  // Add additional details for course detail page
  return {
    ...course,
    modules: [
      {
        id: 1,
        title: 'Getting Started',
        description: 'Introduction to the course and setting up your environment',
        lessons: [
          {
            id: 1,
            title: 'Welcome to the Course',
            content_type: 'video',
            estimated_time_minutes: 10
          },
          {
            id: 2,
            title: 'Setting Up Your Development Environment',
            content_type: 'video',
            estimated_time_minutes: 15
          }
        ]
      },
      {
        id: 2,
        title: 'Core Concepts',
        description: 'Learn the fundamental concepts of the subject',
        lessons: [
          {
            id: 3,
            title: 'Understanding the Basics',
            content_type: 'video',
            estimated_time_minutes: 20
          },
          {
            id: 4,
            title: 'Practical Exercise',
            content_type: 'assignment',
            estimated_time_minutes: 30
          }
        ]
      }
    ],
    reviews: [
      {
        id: 1,
        user_name: 'Sarah P.',
        rating: 5,
        comment: 'Excellent course! Very well explained with practical examples.',
        created_at: '2025-03-10T14:22:00Z'
      },
      {
        id: 2,
        user_name: 'David M.',
        rating: 4,
        comment: 'Great content, though some sections could be more detailed.',
        created_at: '2025-02-25T09:15:00Z'
      }
    ]
  };
};

// Enroll in a course
export const enrollInCourse = async (courseId) => {
  return { success: true, message: 'Successfully enrolled in the course!' };
};

// Get current user's enrollments
export const getUserEnrollments = async () => {
  return mockEnrollments;
};

// Get recommended courses
export const getRecommendedCourses = async () => {
  return mockCourses;
};

// Mark a lesson as complete
export const markLessonComplete = async (courseId, moduleId, lessonId, timeSpent) => {
  return {
    success: true,
    message: 'Lesson marked as complete',
    progress_percentage: 50
  };
};

// Get all course categories
export const getCourseCategories = async () => {
  return mockCategories;
};

// Submit a review for a course
export const submitCourseReview = async (courseId, reviewData) => {
  return {
    id: Math.floor(Math.random() * 1000) + 100,
    user_name: 'You',
    rating: reviewData.rating,
    comment: reviewData.comment,
    created_at: new Date().toISOString()
  };
};