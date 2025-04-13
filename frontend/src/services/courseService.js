import axios from 'axios';
import { API_URL } from '../config';

// Mock data for fallback when API fails
const mockCourses = [
  {
    id: 1,
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of web development including HTML, CSS and JavaScript.',
    category_name: 'Web Development',
    difficulty_level: 'beginner',
    duration_in_weeks: 6,
    instructor_name: 'John Doe',
    thumbnail: 'https://via.placeholder.com/300x200?text=Web+Dev',
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
    thumbnail: 'https://via.placeholder.com/300x200?text=Data+Science',
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
    thumbnail: 'https://via.placeholder.com/300x200?text=Machine+Learning',
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
    thumbnail: 'https://via.placeholder.com/300x200?text=Python',
    average_rating: 4.7,
    total_reviews: 150,
    is_enrolled: false
  }
];

// Get all courses with optional filters
export const getCourses = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/api/courses/courses/`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return []; // Return empty array on error
  }
};

// Get a specific course by ID
export const getCourseById = async (courseId) => {
  try {
    const response = await axios.get(`${API_URL}/api/courses/courses/${courseId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching course ${courseId}:`, error);
    throw error;
  }
};

// Enroll in a course
export const enrollInCourse = async (courseId) => {
  try {
    const response = await axios.post(`${API_URL}/api/courses/courses/${courseId}/enroll/`);
    return response.data;
  } catch (error) {
    console.error(`Error enrolling in course ${courseId}:`, error);
    throw error;
  }
};

// Get current user's enrollments
export const getUserEnrollments = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/courses/enrollments/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user enrollments:', error);
    // Return empty array for development/testing if API fails
    console.log('Returning mock data for enrollments');
    return [
      {
        id: 1,
        course: {
          id: 1,
          title: 'Introduction to Web Development',
          thumbnail: 'https://via.placeholder.com/300x200?text=Web+Dev',
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
          thumbnail: 'https://via.placeholder.com/300x200?text=Data+Science',
        },
        course_title: 'Data Science Fundamentals',
        enrolled_at: '2025-02-10T15:30:00Z',
        completed: false,
        progress_percentage: 25
      }
    ];
  }
};

// Get recommended courses
export const getRecommendedCourses = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/courses/courses/recommended/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recommended courses:', error);
    // Return mock data for development/testing
    return mockCourses;
  }
};

// Mark a lesson as complete
export const markLessonComplete = async (courseId, moduleId, lessonId, timeSpent) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/courses/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/mark_complete/`,
      { time_spent_minutes: timeSpent }
    );
    return response.data;
  } catch (error) {
    console.error(`Error marking lesson ${lessonId} as complete:`, error);
    throw error;
  }
};

// Get all course categories
export const getCourseCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/courses/categories/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course categories:', error);
    // Return mock data for development/testing
    return [
      { id: 1, name: 'Web Development' },
      { id: 2, name: 'Data Science' },
      { id: 3, name: 'Machine Learning' },
      { id: 4, name: 'Programming' },
      { id: 5, name: 'Mobile Development' },
      { id: 6, name: 'DevOps' }
    ];
  }
};

// Submit a review for a course
export const submitCourseReview = async (courseId, reviewData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/courses/courses/${courseId}/review/`,
      reviewData
    );
    return response.data;
  } catch (error) {
    console.error(`Error submitting review for course ${courseId}:`, error);
    throw error;
  }
};