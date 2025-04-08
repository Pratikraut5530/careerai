import axios from "axios";
import { API_URL } from "../config";

export const getProfileFormOptions = async () => {
  try {
    console.log("Fetching profile form options...");
    
    // Fetch all necessary data for profile form in parallel
    const [
      skillsResponse,
      companiesResponse,
      locationsResponse,
      educationLevelsResponse,
      employmentTypesResponse,
      workEnvironmentsResponse,
      jobRolesResponse
    ] = await Promise.all([
      axios.get(`${API_URL}/api/auth/skills/`),
      axios.get(`${API_URL}/api/auth/companies/`),
      axios.get(`${API_URL}/api/auth/locations/`),
      axios.get(`${API_URL}/api/auth/education-levels/`),
      axios.get(`${API_URL}/api/auth/employment-types/`),
      axios.get(`${API_URL}/api/auth/work-environments/`),
      axios.get(`${API_URL}/api/auth/job-roles/`)
    ]);
    
    return {
      skills: skillsResponse.data || [],
      companies: companiesResponse.data || [],
      locations: locationsResponse.data || [],
      educationLevels: educationLevelsResponse.data || [],
      employmentTypes: employmentTypesResponse.data || [],
      workEnvironments: workEnvironmentsResponse.data || [],
      jobRoles: jobRolesResponse.data || []
    };
  } catch (error) {
    console.error("Error fetching profile form options:", error);
    
    // Return mock data for development/testing
    return getMockOptions();
  }
};

// Helper function for mock profile options
function getMockOptions() {
  return {
    skills: [
      { id: 1, name: "JavaScript" },
      { id: 2, name: "Python" },
      { id: 3, name: "React" },
      { id: 4, name: "Django" },
      { id: 5, name: "Machine Learning" },
      { id: 6, name: "SQL" },
      { id: 7, name: "Data Analysis" },
      { id: 8, name: "Project Management" }
    ],
    companies: [
      { id: 1, name: "Google" },
      { id: 2, name: "Microsoft" },
      { id: 3, name: "Amazon" },
      { id: 4, name: "Facebook" },
      { id: 5, name: "Apple" },
      { id: 6, name: "Netflix" }
    ],
    locations: [
      { id: 1, name: "New York" },
      { id: 2, name: "San Francisco" },
      { id: 3, name: "London" },
      { id: 4, name: "Remote" },
      { id: 5, name: "Seattle" },
      { id: 6, name: "Austin" }
    ],
    educationLevels: [
      { id: 1, name: "High School" },
      { id: 2, name: "Associate's Degree" },
      { id: 3, name: "Bachelor's Degree" },
      { id: 4, name: "Master's Degree" },
      { id: 5, name: "PhD" }
    ],
    employmentTypes: [
      { id: 1, name: "Full-time" },
      { id: 2, name: "Part-time" },
      { id: 3, name: "Contract" },
      { id: 4, name: "Freelance" },
      { id: 5, name: "Internship" }
    ],
    workEnvironments: [
      { id: 1, name: "Remote" },
      { id: 2, name: "Hybrid" },
      { id: 3, name: "On-site" }
    ],
    jobRoles: [
      { id: 1, name: "Software Engineer" },
      { id: 2, name: "Data Scientist" },
      { id: 3, name: "Product Manager" },
      { id: 4, name: "UX Designer" },
      { id: 5, name: "DevOps Engineer" },
      { id: 6, name: "Frontend Developer" },
      { id: 7, name: "Backend Developer" },
      { id: 8, name: "Full Stack Developer" }
    ]
  };
}

export const getUserProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/profile/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    
    if (error.response?.status === 404) {
      // Profile doesn't exist yet
      return null;
    }
    
    throw error;
  }
};

export const createUserProfile = async (profileData) => {
  try {
    // Format data for API compatibility
    const formattedData = formatProfileData(profileData);
    
    // Try sending request to the API
    try {
      const response = await axios.post(`${API_URL}/api/auth/profile/`, formattedData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (apiError) {
      // If API returns 405 Method Not Allowed, try PUT instead of POST
      if (apiError.response?.status === 405) {
        const putResponse = await axios.put(`${API_URL}/api/auth/profile/`, formattedData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        return putResponse.data;
      }
      throw apiError;
    }
  } catch (error) {
    console.error("Error creating user profile:", error);
    console.error("Error details:", error.response?.data);
    
    // For development fallback handling
    if (process.env.NODE_ENV === 'development') {
      // Update is_profile_completed flag directly for development
      try {
        await axios.patch(`${API_URL}/api/auth/me/`, {
          is_profile_completed: true
        });
        console.log("Profile completion status updated directly in dev mode");
        return { success: true, status: "profile_completion_updated_directly" };
      } catch (patchError) {
        console.error("Even direct profile completion update failed:", patchError);
      }
    }
    
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const formattedData = formatProfileData(profileData);
    
    const response = await axios.put(`${API_URL}/api/auth/profile/`, formattedData);
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    
    // For development fallback handling
    if (process.env.NODE_ENV === 'development') {
      // Make a direct is_profile_completed update
      if (profileData.is_profile_completed !== undefined) {
        try {
          await axios.patch(`${API_URL}/api/auth/me/`, {
            is_profile_completed: profileData.is_profile_completed
          });
          console.log("Profile completion status updated for dev mode");
          return { success: true, status: "profile_completion_updated" };
        } catch (patchError) {
          console.error("Profile completion direct update failed:", patchError);
        }
      }
    }
    
    throw error;
  }
};

// Format profile data for API compatibility
function formatProfileData(profileData) {
  // Create a deep copy to avoid mutating the original
  let formattedData = JSON.parse(JSON.stringify(profileData));
  
  // Convert string IDs to integers
  if (formattedData.location_id) {
    formattedData.location_id = parseInt(formattedData.location_id);
  }
  
  if (formattedData.preferred_employment_type_id) {
    formattedData.preferred_employment_type_id = parseInt(formattedData.preferred_employment_type_id);
  }
  
  if (formattedData.education_level_id) {
    formattedData.education_level_id = parseInt(formattedData.education_level_id);
  }
  
  // Convert array of string IDs to integers
  ['skill_ids', 'job_roles_of_interest_ids', 'companies_of_interest_ids', 'desired_work_environment_ids'].forEach(field => {
    if (formattedData[field] && Array.isArray(formattedData[field])) {
      formattedData[field] = formattedData[field].map(id => typeof id === 'string' ? parseInt(id) : id);
    }
  });
  
  // Ensure numbers are actually numbers
  if (formattedData.years_of_experience) {
    formattedData.years_of_experience = parseInt(formattedData.years_of_experience) || 0;
  }
  
  return formattedData;
}

// Get skills
export const getSkills = async (search = '') => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/skills/`, {
      params: { search }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching skills:", error);
    // Return mock data for development
    return getMockOptions().skills;
  }
};

// Get companies
export const getCompanies = async (search = '') => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/companies/`, {
      params: { search }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    // Return mock data for development
    return getMockOptions().companies;
  }
};

// Get locations
export const getLocations = async (search = '') => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/locations/`, {
      params: { search }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching locations:", error);
    // Return mock data for development
    return getMockOptions().locations;
  }
};

// Get job roles
export const getJobRoles = async (search = '') => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/job-roles/`, {
      params: { search }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching job roles:", error);
    // Return mock data for development
    return getMockOptions().jobRoles;
  }
};