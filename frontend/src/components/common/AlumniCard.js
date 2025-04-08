import React from 'react';
import { Link } from 'react-router-dom';
import './AlumniCard.css';

const AlumniCard = ({ alumni, showMentorInfo = false }) => {
  const {
    id,
    user,
    graduation_year,
    current_company,
    position,
    is_mentor,
    is_available_for_referrals,
    skills,
    linkedin_profile,
    github_profile
  } = alumni;

  return (
    <div className="alumni-card">
      <div className="alumni-card-header">
        <div className="alumni-card-avatar">
          <img 
            src={user?.profile_image || 'https://via.placeholder.com/80?text=Avatar'} 
            alt={`${user?.first_name} ${user?.last_name}`} 
          />
        </div>
        
        <div className="alumni-card-name-section">
          <h3 className="alumni-card-name">{user?.first_name} {user?.last_name}</h3>
          <div className="alumni-card-position">
            {position} {current_company && <>at {current_company.name}</>}
          </div>
          <div className="alumni-card-grad-year">Class of {graduation_year}</div>
        </div>
      </div>
      
      <div className="alumni-card-badges">
        {is_mentor && (
          <span className="badge mentor-badge">
            <i className="fas fa-chalkboard-teacher"></i> Mentor
          </span>
        )}
        
        {is_available_for_referrals && (
          <span className="badge referral-badge">
            <i className="fas fa-user-plus"></i> Available for Referrals
          </span>
        )}
      </div>
      
      {showMentorInfo && is_mentor && alumni.mentor_profile && (
        <div className="mentor-info">
          <h4>Mentorship Areas</h4>
          <div className="expertise-areas">
            {alumni.mentor_profile.expertise_areas.map(area => (
              <span key={area.id} className="expertise-tag">{area.name}</span>
            ))}
          </div>
        </div>
      )}
      
      <div className="alumni-card-skills">
        <h4>Skills</h4>
        <div className="skill-tags">
          {skills?.slice(0, 5).map(skill => (
            <span key={skill.id} className="skill-tag">{skill.name}</span>
          ))}
          {skills?.length > 5 && <span className="more-skills">+{skills.length - 5} more</span>}
        </div>
      </div>
      
      <div className="alumni-card-social">
        {linkedin_profile && (
          <a href={linkedin_profile} target="_blank" rel="noopener noreferrer" className="social-link">
            <i className="fab fa-linkedin"></i>
          </a>
        )}
        
        {github_profile && (
          <a href={github_profile} target="_blank" rel="noopener noreferrer" className="social-link">
            <i className="fab fa-github"></i>
          </a>
        )}
      </div>
      
      <div className="alumni-card-actions">
        {is_mentor && (
          <Link to={`/mentors/${id}/request`} className="alumni-card-button mentor-request">
            Request Mentorship
          </Link>
        )}
        
        {is_available_for_referrals && (
          <Link to={`/alumni/${id}/referral`} className="alumni-card-button referral-request">
            Request Referral
          </Link>
        )}
        
        <Link to={`/alumni/${id}`} className="alumni-card-button view-profile">
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default AlumniCard;