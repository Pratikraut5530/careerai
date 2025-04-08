import axios from 'axios';
import { API_URL } from '../config';

// Get all jobs with optional filters
export const getJobs = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/api/jobs/jobs/`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    // Return mock data for development
    return [
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
      }
    ];
  }
};

// Get job by ID
export const getJobById = async (jobId) => {
  try {
    const response = await axios.get(`${API_URL}/api/jobs/jobs/${jobId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching job ${jobId}:`, error);
    throw error;
  }
};

// Save a job
export const saveJob = async (jobId) => {
  try {
    const response = await axios.post(`${API_URL}/api/jobs/jobs/${jobId}/save/`);
    return response.data;
  } catch (error) {
    console.error(`Error saving job ${jobId}:`, error);
    // Return mock success
    return { detail: 'Job saved successfully' };
  }
};

// Unsave a job
export const unsaveJob = async (jobId) => {
  try {
    const response = await axios.post(`${API_URL}/api/jobs/jobs/${jobId}/unsave/`);
    return response.data;
  } catch (error) {
    console.error(`Error unsaving job ${jobId}:`, error);
    // Return mock success
    return { detail: 'Job removed from saved jobs' };
  }
};

// Get saved jobs
export const getSavedJobs = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/jobs/saved-jobs/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    // Return mock data
    return [];
  }
};

// Apply for a job
export const applyForJob = async (jobId, applicationData) => {
  try {
    const response = await axios.post(`${API_URL}/api/jobs/jobs/${jobId}/apply/`, applicationData);
    return response.data;
  } catch (error) {
    console.error(`Error applying for job ${jobId}:`, error);
    throw error;
  }
};

// Get user applications
export const getUserApplications = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/jobs/applications/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user applications:', error);
    // Return mock data
    return [
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
      }
    ];
  }
};

// Get recommended jobs
export const getRecommendedJobs = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/jobs/jobs/recommended/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recommended jobs:', error);
    // Return mock data
    return [
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
  }
};

// Create a job alert
export const createJobAlert = async (alertData) => {
  try {
    const response = await axios.post(`${API_URL}/api/jobs/job-alerts/`, alertData);
    return response.data;
  } catch (error) {
    console.error('Error creating job alert:', error);
    throw error;
  }
};

// Get user's job alerts
export const getUserJobAlerts = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/jobs/job-alerts/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job alerts:', error);
    return [];
  }
};

// Update a job alert
export const updateJobAlert = async (alertId, alertData) => {
  try {
    const response = await axios.put(`${API_URL}/api/jobs/job-alerts/${alertId}/`, alertData);
    return response.data;
  } catch (error) {
    console.error(`Error updating job alert ${alertId}:`, error);
    throw error;
  }
};

// Delete a job alert
export const deleteJobAlert = async (alertId) => {
  try {
    const response = await axios.delete(`${API_URL}/api/jobs/job-alerts/${alertId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting job alert ${alertId}:`, error);
    throw error;
  }
};

// Update application status
export const updateApplicationStatus = async (applicationId, status) => {
  try {
    const response = await axios.post(`${API_URL}/api/jobs/applications/${applicationId}/update_status/`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating application ${applicationId} status:`, error);
    throw error;
  }
};