import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getUserProfile,
  getProfileFormOptions,
  updateUserProfile
} from '../../services/profileService';
import './Profile.css';

const ProfileEdit = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [options, setOptions] = useState({
    locations: [],
    employmentTypes: [],
    workEnvironments: [],
    educationLevels: [],
    companies: [],
    jobRoles: [],
    skills: []
  });
  
  const [formData, setFormData] = useState({
    location_id: '',
    employment_status: '',
    preferred_employment_type_id: '',
    desired_work_environment_ids: [],
    education_level_id: '',
    years_of_experience: 0,
    companies_of_interest_ids: [],
    job_roles_of_interest_ids: [],
    skill_ids: [],
    career_vision: '',
    portfolio_url: '',
    is_actively_job_searching: false
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Load profile and form options
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch profile and options in parallel
        const [profileData, optionsData] = await Promise.all([
          getUserProfile(),
          getProfileFormOptions()
        ]);
        
        setProfile(profileData);
        setOptions({
          locations: optionsData.locations || [],
          employmentTypes: optionsData.employmentTypes || [],
          workEnvironments: optionsData.workEnvironments || [],
          educationLevels: optionsData.educationLevels || [],
          companies: optionsData.companies || [],
          jobRoles: optionsData.jobRoles || [],
          skills: optionsData.skills || []
        });
        
        // Initialize form data if profile exists
        if (profileData) {
          setFormData({
            location_id: profileData.location?.id || '',
            employment_status: profileData.employment_status || '',
            preferred_employment_type_id: profileData.preferred_employment_type?.id || '',
            desired_work_environment_ids: (profileData.desired_work_environments || []).map(env => env.id),
            education_level_id: profileData.education_level?.id || '',
            years_of_experience: profileData.years_of_experience || 0,
            companies_of_interest_ids: (profileData.companies_of_interest || []).map(company => company.id),
            job_roles_of_interest_ids: (profileData.job_roles_of_interest || []).map(role => role.id),
            skill_ids: (profileData.skills || []).map(skill => skill.id),
            career_vision: profileData.career_vision || '',
            portfolio_url: profileData.portfolio_url || '',
            is_actively_job_searching: profileData.is_actively_job_searching || false
          });
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    
    setFormData(prev => ({
      ...prev,
      [name]: selectedValues
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);
      
      const result = await updateUserProfile(formData);
      
      // Update the auth context
      if (user && !user.is_profile_completed) {
        await updateProfile({ is_profile_completed: true });
      }
      
      setSuccess(true);
      
      // Scroll to top to show success message
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      
      // Scroll to top to show error message
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }
  
  return (
    <div className="profile-edit-page">
      <div className="page-header">
        <h1>Edit Profile</h1>
        <p>Update your profile information and preferences</p>
      </div>
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i> Profile updated successfully!
        </div>
      )}
      
      <div className="profile-edit-content">
        <form className="profile-edit-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Basic Information</h2>
            
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
          </div>
          
          <div className="form-section">
            <h2>Education & Work Experience</h2>
            
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
          </div>
          
          <div className="form-section">
            <h2>Interests & Skills</h2>
            
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
          </div>
          
          <div className="form-section">
            <h2>Career Goals</h2>
            
            <div className="form-group">
              <label htmlFor="career_vision">Career Vision</label>
              <textarea
                id="career_vision"
                name="career_vision"
                value={formData.career_vision}
                onChange={handleChange}
                placeholder="Describe your career goals and vision..."
                rows="4"
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
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-save" disabled={submitting}>
              {submitting ? "Saving..." : "Save Profile"}
            </button>
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={() => navigate('/dashboard')}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;