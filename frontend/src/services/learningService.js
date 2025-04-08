import axios from 'axios';
import { API_URL } from '../config';

// Upload resume
export const uploadResume = async (resumeData) => {
  try {
    const formData = new FormData();
    formData.append('title', resumeData.title);
    formData.append('file', resumeData.file);
    
    const response = await axios.post(`${API_URL}/api/learning/resumes/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error;
  }
};

// Get user's resumes
export const getUserResumes = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/learning/resumes/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching resumes:', error);
    // Return mock data for development
    return [
      {
        id: 1,
        title: 'Software Developer Resume',
        file: 'http://example.com/resume1.pdf',
        version: 1,
        status: 'reviewed',
        created_at: '2025-02-10T10:15:00Z',
        updated_at: '2025-02-15T14:30:00Z'
      },
      {
        id: 2,
        title: 'Data Scientist Resume',
        file: 'http://example.com/resume2.pdf',
        version: 1,
        status: 'draft',
        created_at: '2025-03-05T09:20:00Z',
        updated_at: '2025-03-05T09:20:00Z'
      }
    ];
  }
};

// Submit resume for analysis
export const submitResumeForAnalysis = async (resumeId) => {
  try {
    const response = await axios.post(`${API_URL}/api/learning/resumes/${resumeId}/submit_for_review/`);
    return response.data;
  } catch (error) {
    console.error(`Error submitting resume ${resumeId} for analysis:`, error);
    throw error;
  }
};

// Get resume analysis
export const getResumeAnalysis = async (resumeId) => {
  try {
    const response = await axios.get(`${API_URL}/api/learning/resumes/${resumeId}/analysis/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching analysis for resume ${resumeId}:`, error);
    // Return mock data for development
    return {
      id: 1,
      resume: {
        id: resumeId,
        title: 'Software Developer Resume',
        status: 'reviewed'
      },
      analysis_text: 'Overall, your resume is well-structured and highlights relevant skills and experiences for software development positions. However, there are some areas for improvement.',
      strengths: '- Clear organization and formatting\n- Strong technical skills section\n- Quantified achievements',
      weaknesses: '- Some technical jargon may be unclear to non-technical recruiters\n- Project descriptions could be more results-oriented\n- Summary section is too generic',
      improvement_suggestions: '- Tailor your summary to specifically mention your expertise areas\n- Add metrics to more of your achievements\n- Consider adding a brief explanation of domain-specific terms\n- Highlight collaborative projects more prominently',
      ai_generated_score: 7.5,
      analyzed_at: '2025-02-15T14:30:00Z'
    };
  }
};

// Get learning paths
export const getLearningPaths = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/learning/learning-paths/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    // Return mock data for development
    return [
      {
        id: 1,
        title: 'Web Development Career Path',
        description: 'A comprehensive learning path to become a full-stack web developer',
        target_skills: [
          { id: 1, name: 'React' },
          { id: 2, name: 'JavaScript' },
          { id: 7, name: 'Node.js' },
          { id: 8, name: 'MongoDB' }
        ],
        is_active: true,
        created_at: '2025-01-15T08:00:00Z',
        updated_at: '2025-01-15T08:00:00Z',
        items: [
          {
            id: 1,
            title: 'Learn HTML & CSS Fundamentals',
            description: 'Master the building blocks of web development',
            item_type: 'course',
            order: 1,
            priority: 'high',
            is_completed: true
          },
          {
            id: 2,
            title: 'JavaScript Basics',
            description: 'Learn core JavaScript concepts and syntax',
            item_type: 'course',
            order: 2,
            priority: 'high',
            is_completed: false
          },
          {
            id: 3,
            title: 'Build a Portfolio Website',
            description: 'Apply your HTML/CSS knowledge to create a personal portfolio',
            item_type: 'project',
            order: 3,
            priority: 'medium',
            is_completed: false
          }
        ]
      },
      {
        id: 2,
        title: 'Data Science Learning Path',
        description: 'Complete curriculum to become a data scientist',
        target_skills: [
          { id: 4, name: 'Python' },
          { id: 5, name: 'Machine Learning' },
          { id: 6, name: 'SQL' }
        ],
        is_active: true,
        created_at: '2025-02-10T09:15:00Z',
        updated_at: '2025-02-10T09:15:00Z',
        items: [
          {
            id: 4,
            title: 'Python for Data Science',
            description: 'Learn Python programming with a focus on data analysis',
            item_type: 'course',
            order: 1,
            priority: 'high',
            is_completed: false
          },
          {
            id: 5,
            title: 'SQL Fundamentals',
            description: 'Master database queries and data manipulation',
            item_type: 'course',
            order: 2,
            priority: 'high',
            is_completed: false
          }
        ]
      }
    ];
  }
};

// Create a learning path
export const createLearningPath = async (pathData) => {
  try {
    const response = await axios.post(`${API_URL}/api/learning/learning-paths/`, pathData);
    return response.data;
  } catch (error) {
    console.error('Error creating learning path:', error);
    throw error;
  }
};

// Generate a personalized learning path
export const generateLearningPath = async (pathId) => {
  try {
    const response = await axios.post(`${API_URL}/api/learning/learning-paths/${pathId}/generate_path/`);
    return response.data;
  } catch (error) {
    console.error(`Error generating learning path ${pathId}:`, error);
    throw error;
  }
};

// Get learning path progress
export const getLearningPathProgress = async (pathId) => {
  try {
    const response = await axios.get(`${API_URL}/api/learning/learning-paths/${pathId}/progress/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching progress for learning path ${pathId}:`, error);
    // Return mock data for development
    return {
      total_items: 5,
      completed_items: 1,
      progress_percentage: 20
    };
  }
};

// Create a learning path item
export const createLearningPathItem = async (pathId, itemData) => {
  try {
    const response = await axios.post(`${API_URL}/api/learning/learning-paths/${pathId}/items/`, itemData);
    return response.data;
  } catch (error) {
    console.error(`Error creating item for learning path ${pathId}:`, error);
    throw error;
  }
};

// Mark a learning path item as complete
export const markLearningPathItemComplete = async (pathId, itemId) => {
  try {
    const response = await axios.post(`${API_URL}/api/learning/learning-paths/${pathId}/items/${itemId}/mark_completed/`);
    return response.data;
  } catch (error) {
    console.error(`Error marking item ${itemId} as complete:`, error);
    throw error;
  }
};

// Add a note to a learning path item
export const addLearningNote = async (pathId, itemId, noteData) => {
  try {
    const response = await axios.post(`${API_URL}/api/learning/learning-paths/${pathId}/items/${itemId}/notes/`, noteData);
    return response.data;
  } catch (error) {
    console.error(`Error adding note to item ${itemId}:`, error);
    throw error;
  }
};

// Get learning notes for an item
export const getLearningNotes = async (pathId, itemId) => {
  try {
    const response = await axios.get(`${API_URL}/api/learning/learning-paths/${pathId}/items/${itemId}/notes/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching notes for item ${itemId}:`, error);
    return [];
  }
};