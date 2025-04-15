// import axios from 'axios';
// import { API_URL } from '../config';

// Mock data for jobs
const mockJobs = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: { 
      id: 1, 
      name: 'TechCorp',
      logo: 'https://via.placeholder.com/80'
    },
    location: { id: 1, name: 'New York' },
    is_remote: true,
    employment_type: { id: 1, name: 'Full-time' },
    salary_min: 70000,
    salary_max: 90000,
    required_skills: [
      { id: 1, name: 'React' },
      { id: 2, name: 'JavaScript' },
      { id: 3, name: 'CSS' }
    ],
    experience_required_years: 2,
    posted_at: '2025-03-15T12:00:00Z',
    is_saved: false,
    has_applied: false
  },
  {
    id: 2,
    title: 'Data Scientist',
    company: { 
      id: 2, 
      name: 'DataWorks',
      logo: 'https://via.placeholder.com/80'
    },
    location: { id: 2, name: 'San Francisco' },
    is_remote: false,
    employment_type: { id: 1, name: 'Full-time' },
    salary_min: 90000,
    salary_max: 120000,
    required_skills: [
      { id: 4, name: 'Python' },
      { id: 5, name: 'Machine Learning' },
      { id: 6, name: 'SQL' }
    ],
    experience_required_years: 3,
    posted_at: '2025-03-10T12:00:00Z',
    is_saved: false,
    has_applied: false
  },
  {
    id: 3,
    title: 'Full Stack Developer',
    company: { 
      id: 3, 
      name: 'WebSolutions',
      logo: 'https://via.placeholder.com/80'
    },
    location: { id: 3, name: 'Austin' },
    is_remote: true,
    employment_type: { id: 1, name: 'Full-time' },
    salary_min: 85000,
    salary_max: 110000,
    required_skills: [
      { id: 1, name: 'React' },
      { id: 2, name: 'JavaScript' },
      { id: 7, name: 'Node.js' },
      { id: 8, name: 'MongoDB' }
    ],
    experience_required_years: 3,
    posted_at: '2025-03-12T14:00:00Z',
    is_saved: false,
    has_applied: false
  },
  {
    id: 4,
    title: 'UX Designer',
    company: { 
      id: 4, 
      name: 'DesignFirst',
      logo: 'https://via.placeholder.com/80'
    },
    location: { id: 4, name: 'Chicago' },
    is_remote: false,
    employment_type: { id: 1, name: 'Full-time' },
    salary_min: 75000,
    salary_max: 95000,
    required_skills: [
      { id: 9, name: 'Figma' },
      { id: 10, name: 'UI/UX Design' },
      { id: 11, name: 'User Research' }
    ],
    experience_required_years: 2,
    posted_at: '2025-03-08T10:00:00Z',
    is_saved: false,
    has_applied: false
  }
];

// Mock applications
const mockApplications = [
  {
    id: 1,
    job: {
      id: 1,
      title: 'Frontend Developer',
      company: {
        name: 'TechCorp',
        logo: 'https://via.placeholder.com/50'
      }
    },
    status: 'applied',
    applied_at: '2025-03-20T15:30:00Z'
  },
  {
    id: 2,
    job: {
      id: 3,
      title: 'Full Stack Developer',
      company: {
        name: 'WebSolutions',
        logo: 'https://via.placeholder.com/50'
      }
    },
    status: 'interview',
    applied_at: '2025-03-18T10:15:00Z'
  }
];

// Get all jobs with optional filters
export const getJobs = async (params = {}) => {
  return mockJobs;
};

// Get job by ID
export const getJobById = async (jobId) => {
  const job = mockJobs.find(j => j.id === parseInt(jobId));
  
  if (!job) {
    throw new Error(`Job with ID ${jobId} not found`);
  }
  
  // Add additional details for job detail page
  return {
    ...job,
    description: 'We are looking for an experienced developer to join our team. You will be responsible for building and maintaining web applications, collaborating with cross-functional teams, and writing clean, maintainable code.',
    responsibilities: '• Develop responsive web applications using modern frameworks\n• Collaborate with designers and backend developers\n• Optimize applications for maximum speed and scalability\n• Write clean, maintainable, and efficient code\n• Stay updated with the latest web technologies',
    requirements: '• Bachelor\'s degree in Computer Science or related field\n• Strong proficiency in JavaScript and related frameworks\n• Experience with responsive design\n• Understanding of web standards and best practices\n• Good problem-solving skills',
    preferred_skills: [
      { id: 12, name: 'TypeScript' },
      { id: 13, name: 'Redux' },
      { id: 14, name: 'Webpack' }
    ],
    application_status: 'open'
  };
};

// Save a job
export const saveJob = async (jobId) => {
  // Update local mock job
  const jobIndex = mockJobs.findIndex(j => j.id === jobId);
  if (jobIndex !== -1) {
    mockJobs[jobIndex].is_saved = true;
  }
  
  return { detail: 'Job saved successfully' };
};

// Unsave a job
export const unsaveJob = async (jobId) => {
  // Update local mock job
  const jobIndex = mockJobs.findIndex(j => j.id === jobId);
  if (jobIndex !== -1) {
    mockJobs[jobIndex].is_saved = false;
  }
  
  return { detail: 'Job removed from saved jobs' };
};

// Get saved jobs
export const getSavedJobs = async () => {
  // Create saved jobs from any jobs that have is_saved = true
  const savedJobs = mockJobs
    .filter(job => job.is_saved)
    .map(job => ({
      id: job.id + 100, // Just to have a different ID for the saved record
      job: job,
      saved_at: '2025-03-25T09:30:00Z'
    }));
    
  return savedJobs;
};

// Apply for a job
export const applyForJob = async (jobId, applicationData) => {
  // Update local mock job
  const jobIndex = mockJobs.findIndex(j => j.id === jobId);
  if (jobIndex !== -1) {
    mockJobs[jobIndex].has_applied = true;
  }
  
  // Add to applications
  mockApplications.push({
    id: Math.floor(Math.random() * 1000) + 100,
    job: mockJobs.find(j => j.id === jobId),
    status: 'applied',
    applied_at: new Date().toISOString()
  });
  
  return { 
    success: true, 
    message: 'Application submitted successfully!' 
  };
};

// Get user applications
export const getUserApplications = async () => {
  return mockApplications;
};

// Get recommended jobs
export const getRecommendedJobs = async () => {
  return mockJobs.slice(0, 3); // Return first 3 jobs as recommendations
};

// Create a job alert
export const createJobAlert = async (alertData) => {
  return {
    id: Math.floor(Math.random() * 1000) + 100,
    keywords: alertData.keywords || '',
    location_id: alertData.location_id || null,
    is_remote: alertData.is_remote || false,
    frequency: alertData.frequency || 'daily',
    created_at: new Date().toISOString()
  };
};

// Get user's job alerts
export const getUserJobAlerts = async () => {
  return [
    {
      id: 1,
      keywords: 'Frontend Developer',
      location_id: 1,
      location_name: 'New York',
      is_remote: true,
      frequency: 'daily',
      created_at: '2025-03-10T08:15:00Z'
    }
  ];
};

// Update a job alert
export const updateJobAlert = async (alertId, alertData) => {
  return {
    id: alertId,
    ...alertData,
    updated_at: new Date().toISOString()
  };
};

// Delete a job alert
export const deleteJobAlert = async (alertId) => {
  return { success: true, message: 'Job alert deleted successfully' };
};

// Update application status
export const updateApplicationStatus = async (applicationId, status) => {
  // Update local mock application
  const appIndex = mockApplications.findIndex(a => a.id === applicationId);
  if (appIndex !== -1) {
    mockApplications[appIndex].status = status;
  }
  
  return { 
    success: true, 
    message: 'Application status updated successfully'
  };
};