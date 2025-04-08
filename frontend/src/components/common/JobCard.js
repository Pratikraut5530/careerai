import React from 'react';
import { Link } from 'react-router-dom';
import './JobCard.css';

const JobCard = ({ job, onSave, onUnsave }) => {
  const {
    id,
    title,
    company,
    location,
    is_remote,
    employment_type,
    salary_min,
    salary_max,
    required_skills,
    experience_required_years,
    posted_at,
    is_saved,
    has_applied
  } = job;

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format salary range
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary not specified';
    if (min && !max) return `$${min.toLocaleString()}+`;
    if (!min && max) return `Up to $${max.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  // Handle save/unsave
  const handleSaveToggle = (e) => {
    e.preventDefault();
    if (is_saved) {
      onUnsave(id);
    } else {
      onSave(id);
    }
  };

  return (
    <div className="job-card">
      <div className="job-card-header">
        <div className="job-card-company-logo">
          <img 
            src={company?.logo || 'https://via.placeholder.com/50?text=Logo'} 
            alt={company?.name} 
          />
        </div>
        
        <div className="job-card-title-section">
          <h3 className="job-card-title">{title}</h3>
          <div className="job-card-company">{company?.name}</div>
        </div>
        
        <button 
          className={`job-card-save ${is_saved ? 'saved' : ''}`} 
          onClick={handleSaveToggle}
          aria-label={is_saved ? 'Unsave job' : 'Save job'}
        >
          <i className={is_saved ? 'fas fa-bookmark' : 'far fa-bookmark'}></i>
        </button>
      </div>
      
      <div className="job-card-details">
        <div className="job-card-detail">
          <i className="fas fa-map-marker-alt"></i> 
          {location?.name} {is_remote && <span className="remote-badge">Remote</span>}
        </div>
        
        <div className="job-card-detail">
          <i className="fas fa-briefcase"></i> {employment_type?.name}
        </div>
        
        <div className="job-card-detail">
          <i className="fas fa-money-bill-wave"></i> {formatSalary(salary_min, salary_max)}
        </div>
        
        <div className="job-card-detail">
          <i className="fas fa-user-graduate"></i> 
          {experience_required_years} {experience_required_years === 1 ? 'year' : 'years'} experience
        </div>
      </div>
      
      <div className="job-card-skills">
        {required_skills?.slice(0, 5).map(skill => (
          <span key={skill.id} className="skill-tag">{skill.name}</span>
        ))}
        {required_skills?.length > 5 && <span className="more-skills">+{required_skills.length - 5} more</span>}
      </div>
      
      <div className="job-card-footer">
        <div className="job-card-posted">
          Posted on {formatDate(posted_at)}
        </div>
        
        <div className="job-card-actions">
          {has_applied ? (
            <span className="applied-badge">Applied</span>
          ) : (
            <Link to={`/jobs/${id}`} className="job-card-button">
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;