import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getProfileFormOptions, createUserProfile } from '../../services/profileService';
import axios from 'axios';
import { API_URL } from '../../config';
import './ProfileCompletion.css';

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    location_id: "",
    employment_status: "",
    preferred_employment_type_id: "",
    desired_work_environment_ids: [],
    education_level_id: "",
    years_of_experience: 0,
    companies_of_interest_ids: [],
    job_roles_of_interest_ids: [],
    skill_ids: [],
    career_vision: "",
    portfolio_url: "",
    is_actively_job_searching: false
  });
  
  const [options, setOptions] = useState({
    locations: [],
    employmentTypes: [],
    workEnvironments: [],
    educationLevels: [],
    companies: [],
    jobRoles: [],
    skills: []
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getProfileFormOptions();
        
        setOptions({
          locations: data.locations || [],
          employmentTypes: data.employmentTypes || [],
          workEnvironments: data.workEnvironments || [],
          educationLevels: data.educationLevels || [],
          companies: data.companies || [],
          jobRoles: data.jobRoles || [],
          skills: data.skills || []
        });
      } catch (err) {
        console.error("Error fetching form options:", err);
        setError("Failed to load form options. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOptions();
  }, []);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    
    setFormData({
      ...formData,
      [name]: selectedValues
    });
  };
  
  const nextStep = () => {
    // Basic validation for each step
    if (currentStep === 1) {
      if (!formData.location_id || !formData.employment_status) {
        setError("Please complete all required fields before proceeding");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.education_level_id || !formData.preferred_employment_type_id || formData.desired_work_environment_ids.length === 0) {
        setError("Please complete all required fields before proceeding");
        return;
      }
    } else if (currentStep === 3) {
      if (formData.skill_ids.length === 0 || formData.job_roles_of_interest_ids.length === 0) {
        setError("Please select at least one skill and job role before proceeding");
        return;
      }
    }
    
    setError(null);
    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };
  
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Ensure all required fields are filled
      if (!validateFinalStep()) {
        setSubmitting(false);
        return;
      }
      
      // Add required conversions for API compatibility
      const formattedData = {
        ...formData,
        location_id: formData.location_id ? parseInt(formData.location_id) : null,
        preferred_employment_type_id: formData.preferred_employment_type_id 
          ? parseInt(formData.preferred_employment_type_id) 
          : null,
        education_level_id: formData.education_level_id 
          ? parseInt(formData.education_level_id) 
          : null,
        years_of_experience: parseInt(formData.years_of_experience) || 0,
        skill_ids: formData.skill_ids.map(id => parseInt(id)),
        job_roles_of_interest_ids: formData.job_roles_of_interest_ids.map(id => parseInt(id)),
        companies_of_interest_ids: formData.companies_of_interest_ids.map(id => parseInt(id)),
        desired_work_environment_ids: formData.desired_work_environment_ids.map(id => parseInt(id))
      };
      
      console.log("Submitting profile data:", formattedData);
      
      try {
        // Create the profile first
        const result = await createUserProfile(formattedData);
        console.log("Profile creation successful:", result);
        
        // CRITICAL FIX: Make a direct API call to update profile completion status
        // This ensures the backend knows the profile is completed
        const profileUpdateResponse = await axios.patch(`${API_URL}/api/auth/me/`, {
          is_profile_completed: true
        });
        console.log("Profile completion status updated:", profileUpdateResponse.data);
        
        // Then update auth context
        await updateProfile({ is_profile_completed: true });
        
        setSuccess(true);
        
        // Force reload user data from API to ensure we have the latest state
        try {
          const userResponse = await axios.get(`${API_URL}/api/auth/me/`);
          console.log("Updated user data:", userResponse.data);
        } catch (refreshErr) {
          console.error("Error refreshing user data:", refreshErr);
        }
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
      } catch (apiError) {
        console.error("API error during profile creation:", apiError);
        
        // Fallback: If profile creation failed but we're in development mode,
        // still try to update the profile completion status directly
        if (process.env.NODE_ENV === 'development') {
          try {
            await axios.patch(`${API_URL}/api/auth/me/`, {
              is_profile_completed: true
            });
            await updateProfile({ is_profile_completed: true });
            setSuccess(true);
            
            // Force update
            localStorage.setItem('profile_completed', 'true');
            
            // Redirect anyway in development
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 1500);
            
            return;
          } catch (fallbackErr) {
            console.error("Even fallback failed:", fallbackErr);
            throw apiError; // Re-throw the original error
          }
        } else {
          throw apiError;
        }
      }
    } catch (err) {
      console.error("Profile creation error:", err);
      setError(err.response?.data?.message || "Failed to complete your profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  
  const validateFinalStep = () => {
    if (!formData.career_vision.trim()) {
      setError("Please enter your career vision before submitting");
      return false;
    }
    return true;
  };
  
  const skipProfileCompletion = async () => {
    try {
      // Set profile as completed via API when skipping
      await axios.patch(`${API_URL}/api/auth/me/`, {
        is_profile_completed: true
      });
      
      // Update auth context
      await updateProfile({ is_profile_completed: true });
      
      // Set localStorage flag
      localStorage.setItem('profile_completed', 'true');
      
      // Navigate to dashboard
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Error while skipping profile completion:", error);
      
      // Even if API fails, set localStorage flag as fallback
      localStorage.setItem('profile_completed', 'true');
      navigate("/dashboard", { replace: true });
    }
  };
  
  if (loading) {
    return <div className="loading">Loading profile form...</div>;
  }
  
  return (
    <div className="profile-completion-page">
      <div className="profile-completion-card">
        <div className="profile-completion-header">
          <h2>Complete Your Profile</h2>
          <p>Help us personalize your CareerAI experience</p>
          
          <div className="progress-steps">
            <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
              <div className="step-number">1</div>
              <div className="step-label">Basic Info</div>
            </div>
            <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
              <div className="step-number">2</div>
              <div className="step-label">Education & Work</div>
            </div>
            <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
              <div className="step-number">3</div>
              <div className="step-label">Interests & Skills</div>
            </div>
            <div className={`step ${currentStep >= 4 ? "active" : ""}`}>
              <div className="step-number">4</div>
              <div className="step-label">Career Goals</div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="profile-error">
            <i className="fas fa-exclamation-circle"></i> {error}
            <button onClick={skipProfileCompletion} className="skip-btn">
              Skip for now and go to dashboard
            </button>
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <i className="fas fa-check-circle"></i> Profile created successfully! Redirecting to dashboard...
          </div>
        )}
        
        <form className="profile-completion-form" onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="form-step">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="location_id">Location</label>
                <select
                  id="location_id"
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your location</option>
                  {options.locations.map(location => (
                    <option key={location.id} value={location.id}>{location.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="employment_status">Current Employment Status</label>
                <select
                  id="employment_status"
                  name="employment_status"
                  value={formData.employment_status}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your status</option>
                  <option value="employed">Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="student">Student</option>
                  <option value="freelancer">Freelancer</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="is_actively_job_searching">Are you actively searching for a job?</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="is_actively_job_searching"
                    name="is_actively_job_searching"
                    checked={formData.is_actively_job_searching}
                    onChange={handleChange}
                  />
                  <label htmlFor="is_actively_job_searching">
                    <span className="toggle-label">{formData.is_actively_job_searching ? "Yes" : "No"}</span>
                  </label>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-next" onClick={nextStep}>Next</button>
                <button type="button" className="btn-skip" onClick={skipProfileCompletion}>
                  Skip for now
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Education & Work Experience */}
          {currentStep === 2 && (
            <div className="form-step">
              <h3>Education & Work Experience</h3>
              
              <div className="form-group">
                <label htmlFor="education_level_id">Highest Education Level</label>
                <select
                  id="education_level_id"
                  name="education_level_id"
                  value={formData.education_level_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select education level</option>
                  {options.educationLevels.map(level => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="years_of_experience">Years of Professional Experience</label>
                <input
                  type="number"
                  id="years_of_experience"
                  name="years_of_experience"
                  value={formData.years_of_experience}
                  onChange={handleChange}
                  min="0"
                  max="50"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="preferred_employment_type_id">Preferred Employment Type</label>
                <select
                  id="preferred_employment_type_id"
                  name="preferred_employment_type_id"
                  value={formData.preferred_employment_type_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select employment type</option>
                  {options.employmentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="desired_work_environment_ids">Desired Work Environment</label>
                <select
                  id="desired_work_environment_ids"
                  name="desired_work_environment_ids"
                  multiple
                  value={formData.desired_work_environment_ids}
                  onChange={handleMultiSelectChange}
                  required
                >
                  {options.workEnvironments.map(env => (
                    <option key={env.id} value={env.id}>{env.name}</option>
                  ))}
                </select>
                <small>Hold Ctrl (or Cmd) to select multiple options</small>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-prev" onClick={prevStep}>Previous</button>
                <button type="button" className="btn-next" onClick={nextStep}>Next</button>
                <button type="button" className="btn-skip" onClick={skipProfileCompletion}>
                  Skip for now
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Interests & Skills */}
          {currentStep === 3 && (
            <div className="form-step">
              <h3>Interests & Skills</h3>
              
              <div className="form-group">
                <label htmlFor="companies_of_interest_ids">Companies You're Interested In</label>
                <select
                  id="companies_of_interest_ids"
                  name="companies_of_interest_ids"
                  multiple
                  value={formData.companies_of_interest_ids}
                  onChange={handleMultiSelectChange}
                >
                  {options.companies.map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
                <small>Hold Ctrl (or Cmd) to select multiple options</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="job_roles_of_interest_ids">Job Roles You're Interested In</label>
                <select
                  id="job_roles_of_interest_ids"
                  name="job_roles_of_interest_ids"
                  multiple
                  value={formData.job_roles_of_interest_ids}
                  onChange={handleMultiSelectChange}
                  required
                >
                  {options.jobRoles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
                <small>Hold Ctrl (or Cmd) to select multiple options</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="skill_ids">Your Skills</label>
                <select
                  id="skill_ids"
                  name="skill_ids"
                  multiple
                  value={formData.skill_ids}
                  onChange={handleMultiSelectChange}
                  required
                >
                  {options.skills.map(skill => (
                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                  ))}
                </select>
                <small>Hold Ctrl (or Cmd) to select multiple options</small>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-prev" onClick={prevStep}>Previous</button>
                <button type="button" className="btn-next" onClick={nextStep}>Next</button>
                <button type="button" className="btn-skip" onClick={skipProfileCompletion}>
                  Skip for now
                </button>
              </div>
            </div>
          )}
          
          {/* Step 4: Career Goals */}
          {currentStep === 4 && (
            <div className="form-step">
              <h3>Career Goals</h3>
              
              <div className="form-group">
                <label htmlFor="career_vision">Career Vision</label>
                <textarea
                  id="career_vision"
                  name="career_vision"
                  value={formData.career_vision}
                  onChange={handleChange}
                  placeholder="Describe your career goals and vision..."
                  rows="4"
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="portfolio_url">Portfolio URL (Optional)</label>
                <input
                  type="url"
                  id="portfolio_url"
                  name="portfolio_url"
                  value={formData.portfolio_url}
                  onChange={handleChange}
                  placeholder="https://your-portfolio.com"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-prev" onClick={prevStep}>Previous</button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? "Saving Profile..." : "Complete Profile"}
                </button>
                <button type="button" onClick={skipProfileCompletion} className="btn-skip">
                  Skip for now
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletion;