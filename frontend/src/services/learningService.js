// import axios from 'axios';
// import { API_URL } from '../config';

// Mock resumes data
const mockResumes = [
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

// Mock learning paths
const mockLearningPaths = [
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
        estimated_completion_days: 14,
        is_completed: true,
        course: {
          id: 5, 
          title: 'HTML & CSS Fundamentals'
        }
      },
      {
        id: 2,
        title: 'JavaScript Basics',
        description: 'Learn core JavaScript concepts and syntax',
        item_type: 'course',
        order: 2,
        priority: 'high',
        estimated_completion_days: 21,
        is_completed: false,
        course: {
          id: 6,
          title: 'JavaScript Basics'
        }
      },
      {
        id: 3,
        title: 'Build a Portfolio Website',
        description: 'Apply your HTML/CSS knowledge to create a personal portfolio',
        item_type: 'project',
        order: 3,
        priority: 'medium',
        estimated_completion_days: 7,
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
        estimated_completion_days: 28,
        is_completed: false,
        course: {
          id: 7,
          title: 'Python for Data Science'
        }
      },
      {
        id: 5,
        title: 'SQL Fundamentals',
        description: 'Master database queries and data manipulation',
        item_type: 'course',
        order: 2,
        priority: 'high',
        estimated_completion_days: 14,
        is_completed: false,
        course: {
          id: 8,
          title: 'SQL Fundamentals'
        }
      }
    ]
  }
];

// Mock resume analysis data
const mockResumeAnalysis = {
  id: 1,
  resume: {
    id: 1,
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

// Upload resume
export const uploadResume = async (resumeData) => {
  // Create a new mock resume
  const newResume = {
    id: mockResumes.length + 1,
    title: resumeData.title,
    file: 'http://example.com/resume' + (mockResumes.length + 1) + '.pdf',
    version: 1,
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  mockResumes.push(newResume);
  
  return newResume;
};

// Get user's resumes
export const getUserResumes = async () => {
  return mockResumes;
};

// Submit resume for analysis
export const submitResumeForAnalysis = async (resumeId) => {
  // Find and update the resume status
  const resumeIndex = mockResumes.findIndex(r => r.id === parseInt(resumeId));
  if (resumeIndex !== -1) {
    mockResumes[resumeIndex].status = 'under_review';
  }
  
  return { 
    success: true, 
    message: 'Resume submitted for analysis successfully' 
  };
};

// Get resume analysis
export const getResumeAnalysis = async (resumeId) => {
  // Just return the mock analysis for any resume ID for the presentation
  return {
    ...mockResumeAnalysis,
    resume: {
      ...mockResumeAnalysis.resume,
      id: parseInt(resumeId)
    }
  };
};

// Get learning paths
export const getLearningPaths = async () => {
  return mockLearningPaths;
};

// Create a learning path
export const createLearningPath = async (pathData) => {
  const newPath = {
    id: mockLearningPaths.length + 1,
    ...pathData,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: []
  };
  
  mockLearningPaths.push(newPath);
  
  return newPath;
};

// Generate a personalized learning path
export const generateLearningPath = async (pathId) => {
  // Find the path
  const pathIndex = mockLearningPaths.findIndex(p => p.id === parseInt(pathId));
  
  if (pathIndex !== -1) {
    // Add some generated items
    mockLearningPaths[pathIndex].items = [
      {
        id: 100,
        title: 'Foundation Course',
        description: 'Learn the fundamentals of the subject area',
        item_type: 'course',
        order: 1,
        priority: 'high',
        estimated_completion_days: 21,
        is_completed: false,
        course: {
          id: 10,
          title: 'Foundation Course'
        }
      },
      {
        id: 101,
        title: 'Intermediate Skills Workshop',
        description: 'Build on your foundational knowledge with more advanced concepts',
        item_type: 'workshop',
        order: 2,
        priority: 'medium',
        estimated_completion_days: 7,
        is_completed: false
      },
      {
        id: 102,
        title: 'Online Tutorial Series',
        description: 'Follow this excellent tutorial series to solidify your skills',
        item_type: 'resource',
        external_url: 'https://example.com/tutorials',
        order: 3,
        priority: 'medium',
        estimated_completion_days: 14,
        is_completed: false
      },
      {
        id: 103,
        title: 'Capstone Project',
        description: 'Apply all your skills in a real-world project',
        item_type: 'project',
        order: 4,
        priority: 'high',
        estimated_completion_days: 30,
        is_completed: false
      }
    ];
  }
  
  return { 
    success: true, 
    message: 'Learning path generated successfully',
    path_id: parseInt(pathId)
  };
};

// Get learning path progress
export const getLearningPathProgress = async (pathId) => {
  const path = mockLearningPaths.find(p => p.id === parseInt(pathId));
  
  if (!path) {
    return {
      total_items: 0,
      completed_items: 0,
      progress_percentage: 0
    };
  }
  
  const totalItems = path.items.length;
  const completedItems = path.items.filter(item => item.is_completed).length;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  return {
    total_items: totalItems,
    completed_items: completedItems,
    progress_percentage: progressPercentage
  };
};

// Create a learning path item
export const createLearningPathItem = async (pathId, itemData) => {
  // Find the path
  const pathIndex = mockLearningPaths.findIndex(p => p.id === parseInt(pathId));
  
  if (pathIndex === -1) {
    throw new Error(`Learning path with ID ${pathId} not found`);
  }
  
  const newItem = {
    id: Math.floor(Math.random() * 1000) + 200,
    ...itemData,
    is_completed: false
  };
  
  mockLearningPaths[pathIndex].items.push(newItem);
  
  return newItem;
};

// Mark a learning path item as complete
export const markLearningPathItemComplete = async (pathId, itemId) => {
  // Find the path
  const pathIndex = mockLearningPaths.findIndex(p => p.id === parseInt(pathId));
  
  if (pathIndex === -1) {
    throw new Error(`Learning path with ID ${pathId} not found`);
  }
  
  // Find the item
  const itemIndex = mockLearningPaths[pathIndex].items.findIndex(i => i.id === parseInt(itemId));
  
  if (itemIndex === -1) {
    throw new Error(`Item with ID ${itemId} not found in path ${pathId}`);
  }
  
  // Mark item as completed
  mockLearningPaths[pathIndex].items[itemIndex].is_completed = true;
  
  return { 
    success: true, 
    message: 'Item marked as complete successfully' 
  };
};

// Add a note to a learning path item
export const addLearningNote = async (pathId, itemId, noteData) => {
  return {
    id: Math.floor(Math.random() * 1000) + 300,
    path_id: parseInt(pathId),
    item_id: parseInt(itemId),
    ...noteData,
    created_at: new Date().toISOString()
  };
};

// Get learning notes for an item
export const getLearningNotes = async (pathId, itemId) => {
  return [
    {
      id: 1,
      path_id: parseInt(pathId),
      item_id: parseInt(itemId),
      content: 'This was a really helpful resource. I learned a lot about the fundamentals.',
      created_at: '2025-03-10T14:20:00Z'
    }
  ];
};