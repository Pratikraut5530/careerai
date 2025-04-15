import axios from "axios";
import { API_URL } from "../config";
import { indianLocations } from "./locationService";

// Technical skills list
export const techSkills = [
  // Programming Languages
  { id: 1, name: "JavaScript" },
  { id: 2, name: "Python" },
  { id: 3, name: "Java" },
  { id: 4, name: "C++" },
  { id: 5, name: "C#" },
  { id: 6, name: "PHP" },
  { id: 7, name: "TypeScript" },
  { id: 8, name: "Ruby" },
  { id: 9, name: "Swift" },
  { id: 10, name: "Kotlin" },
  { id: 11, name: "Go" },
  { id: 12, name: "Rust" },
  { id: 13, name: "Scala" },
  { id: 14, name: "R" },
  { id: 15, name: "Dart" },
  
  // Web Development - Frontend
  { id: 16, name: "HTML" },
  { id: 17, name: "CSS" },
  { id: 18, name: "React" },
  { id: 19, name: "Angular" },
  { id: 20, name: "Vue.js" },
  { id: 21, name: "Redux" },
  { id: 22, name: "jQuery" },
  { id: 23, name: "SASS/SCSS" },
  { id: 24, name: "Bootstrap" },
  { id: 25, name: "Tailwind CSS" },
  { id: 26, name: "Material UI" },
  { id: 27, name: "Responsive Design" },
  { id: 28, name: "Progressive Web Apps" },
  { id: 29, name: "Next.js" },
  { id: 30, name: "Gatsby" },
  
  // Web Development - Backend
  { id: 31, name: "Node.js" },
  { id: 32, name: "Express.js" },
  { id: 33, name: "Django" },
  { id: 34, name: "Flask" },
  { id: 35, name: "Spring Boot" },
  { id: 36, name: "Laravel" },
  { id: 37, name: "ASP.NET" },
  { id: 38, name: "Ruby on Rails" },
  { id: 39, name: "FastAPI" },
  { id: 40, name: "GraphQL" },
  { id: 41, name: "REST API" },
  { id: 42, name: "Microservices" },
  { id: 43, name: "Serverless Architecture" },
  
  // Database Technologies
  { id: 44, name: "SQL" },
  { id: 45, name: "MySQL" },
  { id: 46, name: "PostgreSQL" },
  { id: 47, name: "MongoDB" },
  { id: 48, name: "Redis" },
  { id: 49, name: "Elasticsearch" },
  { id: 50, name: "Oracle" },
  { id: 51, name: "Microsoft SQL Server" },
  { id: 52, name: "Cassandra" },
  { id: 53, name: "Firebase" },
  { id: 54, name: "DynamoDB" },
  { id: 55, name: "Neo4j" },
  { id: 56, name: "Database Design" },
  
  // DevOps & Cloud
  { id: 57, name: "AWS" },
  { id: 58, name: "Azure" },
  { id: 59, name: "Google Cloud" },
  { id: 60, name: "Docker" },
  { id: 61, name: "Kubernetes" },
  { id: 62, name: "Jenkins" },
  { id: 63, name: "CI/CD" },
  { id: 64, name: "Terraform" },
  { id: 65, name: "Ansible" },
  { id: 66, name: "Linux" },
  { id: 67, name: "Bash Scripting" },
  { id: 68, name: "Git" },
  { id: 69, name: "GitHub" },
  { id: 70, name: "GitLab" },
  { id: 71, name: "Infrastructure as Code" },
  
  // Mobile Development
  { id: 72, name: "Android Development" },
  { id: 73, name: "iOS Development" },
  { id: 74, name: "React Native" },
  { id: 75, name: "Flutter" },
  { id: 76, name: "Xamarin" },
  { id: 77, name: "Ionic" },
  { id: 78, name: "Mobile UI/UX" },
  { id: 79, name: "SwiftUI" },
  { id: 80, name: "Jetpack Compose" },
  
  // Data Science & Analysis
  { id: 81, name: "Machine Learning" },
  { id: 82, name: "Deep Learning" },
  { id: 83, name: "Data Analysis" },
  { id: 84, name: "Data Visualization" },
  { id: 85, name: "Natural Language Processing" },
  { id: 86, name: "Computer Vision" },
  { id: 87, name: "TensorFlow" },
  { id: 88, name: "PyTorch" },
  { id: 89, name: "scikit-learn" },
  { id: 90, name: "Pandas" },
  { id: 91, name: "NumPy" },
  { id: 92, name: "Matplotlib" },
  { id: 93, name: "Big Data" },
  { id: 94, name: "Hadoop" },
  { id: 95, name: "Spark" },
  { id: 96, name: "Reinforcement Learning" },
  
  // UI/UX & Design
  { id: 97, name: "UI Design" },
  { id: 98, name: "UX Design" },
  { id: 99, name: "Figma" },
  { id: 100, name: "Adobe XD" },
  { id: 101, name: "Sketch" },
  { id: 102, name: "Wireframing" },
  { id: 103, name: "Prototyping" },
  { id: 104, name: "User Research" },
  { id: 105, name: "Interaction Design" },
  { id: 106, name: "Usability Testing" },
  
  // Testing & QA
  { id: 107, name: "Unit Testing" },
  { id: 108, name: "Integration Testing" },
  { id: 109, name: "Automated Testing" },
  { id: 110, name: "Manual Testing" },
  { id: 111, name: "Jest" },
  { id: 112, name: "Selenium" },
  { id: 113, name: "Cypress" },
  { id: 114, name: "JUnit" },
  { id: 115, name: "Mocha" },
  { id: 116, name: "TDD" },
  { id: 117, name: "BDD" },
  { id: 118, name: "Performance Testing" },
  
  // Project Management & Methodologies
  { id: 119, name: "Agile" },
  { id: 120, name: "Scrum" },
  { id: 121, name: "Kanban" },
  { id: 122, name: "Jira" },
  { id: 123, name: "Confluence" },
  { id: 124, name: "Trello" },
  { id: 125, name: "Project Management" },
  { id: 126, name: "Technical Documentation" },
  { id: 127, name: "Requirements Analysis" },
  
  // AI & Emerging Technologies
  { id: 128, name: "Artificial Intelligence" },
  { id: 129, name: "Blockchain" },
  { id: 130, name: "IoT" },
  { id: 131, name: "AR/VR" },
  { id: 132, name: "Generative AI" },
  { id: 133, name: "Chatbot Development" },
  { id: 134, name: "LLM Prompt Engineering" },
  { id: 135, name: "Edge Computing" },
  { id: 136, name: "Quantum Computing" },
  
  // Security
  { id: 137, name: "Cybersecurity" },
  { id: 138, name: "Network Security" },
  { id: 139, name: "Ethical Hacking" },
  { id: 140, name: "Security Auditing" },
  { id: 141, name: "Penetration Testing" },
  { id: 142, name: "OWASP" },
  { id: 143, name: "Encryption" },
  { id: 144, name: "Identity & Access Management" },
  
  // Soft Skills in Tech
  { id: 145, name: "Technical Writing" },
  { id: 146, name: "Problem Solving" },
  { id: 147, name: "Critical Thinking" },
  { id: 148, name: "Collaboration" },
  { id: 149, name: "Team Leadership" },
  { id: 150, name: "Communication" },
  { id: 151, name: "Mentoring" },
  { id: 152, name: "Code Review" },
  { id: 153, name: "Systems Thinking" },
  { id: 154, name: "Time Management" },
  { id: 155, name: "Adaptability" }
];

export const getProfileFormOptions = async () => {
  try {
    console.log("Fetching profile form options...");
    
    // For presentation, directly return mock data
    return getMockOptions();
    
    // The following code is kept for reference, but for the presentation, we'll skip the API calls
    /*
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
      skills: skillsResponse.data || techSkills,
      companies: companiesResponse.data || [],
      locations: locationsResponse.data || [],
      educationLevels: educationLevelsResponse.data || [],
      employmentTypes: employmentTypesResponse.data || [],
      workEnvironments: workEnvironmentsResponse.data || [],
      jobRoles: jobRolesResponse.data || []
    };
    */
  } catch (error) {
    console.error("Error fetching profile form options:", error);
    
    // Return mock data for development/testing
    return getMockOptions();
  }
};

// Helper function for mock profile options
function getMockOptions() {
  return {
    skills: techSkills,
    companies: [
      { id: 1, name: "Google" },
      { id: 2, name: "Microsoft" },
      { id: 3, name: "Amazon" },
      { id: 4, name: "Facebook" },
      { id: 5, name: "Apple" },
      { id: 6, name: "Netflix" }
    ],
    locations: indianLocations,
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
    // For the presentation, return a mock profile
    return {
      id: 1,
      user: {
        id: 1,
        first_name: "John",
        last_name: "Doe"
      },
      location: { id: 6, name: "Karnataka - Bengaluru" },
      employment_status: "employed",
      preferred_employment_type: { id: 1, name: "Full-time" },
      education_level: { id: 3, name: "Bachelor's Degree" },
      years_of_experience: 3,
      skills: [
        { id: 1, name: "JavaScript" },
        { id: 18, name: "React" },
        { id: 31, name: "Node.js" }
      ],
      desired_work_environments: [
        { id: 1, name: "Remote" },
        { id: 2, name: "Hybrid" }
      ],
      companies_of_interest: [
        { id: 1, name: "Google" },
        { id: 3, name: "Amazon" }
      ],
      job_roles_of_interest: [
        { id: 6, name: "Frontend Developer" },
        { id: 8, name: "Full Stack Developer" }
      ],
      career_vision: "I aim to become a senior full-stack developer leading projects that make a positive impact.",
      portfolio_url: "https://johndoe-portfolio.com",
      is_actively_job_searching: true,
      is_profile_completed: true
    };
    
    // The following code is kept for reference
    /*
    const response = await axios.get(`${API_URL}/api/auth/profile/`);
    return response.data;
    */
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
    
    // For presentation, directly return success
    console.log("Creating profile with data:", formattedData);
    
    return { 
      success: true,
      message: "Profile created successfully",
      ...formattedData
    };
    
    // The following code is kept for reference
    /*
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
    */
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
    
    // For presentation, directly return success
    console.log("Updating profile with data:", formattedData);
    
    return { 
      success: true,
      message: "Profile updated successfully",
      ...formattedData
    };
    
    // The following code is kept for reference
    /*
    const response = await axios.put(`${API_URL}/api/auth/profile/`, formattedData);
    return response.data;
    */
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
  // Return techSkills list for presentation
  return techSkills;
};

// Get companies
export const getCompanies = async (search = '') => {
  // Return mock data for presentation
  return [
    { id: 1, name: "Google" },
    { id: 2, name: "Microsoft" },
    { id: 3, name: "Amazon" },
    { id: 4, name: "Meta (Facebook)" },
    { id: 5, name: "Apple" },
    { id: 6, name: "Netflix" },
    { id: 7, name: "Adobe" },
    { id: 8, name: "IBM" },
    { id: 9, name: "Intel" },
    { id: 10, name: "Oracle" },
    { id: 11, name: "Salesforce" },
    { id: 12, name: "Cisco" },
    { id: 13, name: "Infosys" },
    { id: 14, name: "TCS" },
    { id: 15, name: "Wipro" },
    { id: 16, name: "HCL Technologies" },
    { id: 17, name: "Tech Mahindra" },
    { id: 18, name: "Capgemini" },
    { id: 19, name: "Accenture" },
    { id: 20, name: "Cognizant" }
  ];
};

// Get locations
export const getLocations = async (search = '') => {
  // Return indianLocations list for presentation
  return indianLocations;
};

// Get job roles
export const getJobRoles = async (search = '') => {
  // Return mock data for presentation
  return [
    { id: 1, name: "Software Engineer" },
    { id: 2, name: "Data Scientist" },
    { id: 3, name: "Product Manager" },
    { id: 4, name: "UX Designer" },
    { id: 5, name: "DevOps Engineer" },
    { id: 6, name: "Frontend Developer" },
    { id: 7, name: "Backend Developer" },
    { id: 8, name: "Full Stack Developer" },
    { id: 9, name: "Mobile Developer" },
    { id: 10, name: "AI/ML Engineer" },
    { id: 11, name: "Cloud Architect" },
    { id: 12, name: "QA Engineer" },
    { id: 13, name: "Security Engineer" },
    { id: 14, name: "Data Engineer" },
    { id: 15, name: "Technical Writer" },
    { id: 16, name: "Technical Support" },
    { id: 17, name: "System Administrator" },
    { id: 18, name: "Database Administrator" },
    { id: 19, name: "Blockchain Developer" },
    { id: 20, name: "Game Developer" }
  ];
};