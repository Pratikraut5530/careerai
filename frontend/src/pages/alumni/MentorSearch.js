import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AlumniCard from '../../components/common/AlumniCard';
import { getMentors } from '../../services/alumniService';
import './Alumni.css';

const MentorSearch = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    expertiseArea: '',
    yearsExperience: '',
    company: '',
    availabilityOnly: true
  });
  
  // Expertise areas (these could be fetched from an API)
  const expertiseAreas = [
    { id: 1, name: 'Web Development' },
    { id: 2, name: 'Career Advancement' },
    { id: 3, name: 'Product Management' },
    { id: 4, name: 'Interview Preparation' },
    { id: 5, name: 'Machine Learning' },
    { id: 6, name: 'UX Design' },
    { id: 7, name: 'Leadership' }
  ];
  
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const data = await getMentors();
        setMentors(data);
      } catch (err) {
        console.error('Error fetching mentors:', err);
        setError('Failed to load mentors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMentors();
  }, []);
  
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFilters(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const resetFilters = () => {
    setFilters({
      expertiseArea: '',
      yearsExperience: '',
      company: '',
      availabilityOnly: true
    });
    setSearchTerm('');
  };
  
  // Apply filters and search
  const filteredMentors = mentors.filter(mentor => {
    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const fullName = `${mentor.alumni.user.first_name} ${mentor.alumni.user.last_name}`.toLowerCase();
      const matchesName = fullName.includes(term);
      const matchesCompany = mentor.alumni.current_company?.name.toLowerCase().includes(term);
      const matchesPosition = mentor.alumni.position.toLowerCase().includes(term);
      const matchesStyle = mentor.mentorship_style?.toLowerCase().includes(term);
      
      if (!matchesName && !matchesCompany && !matchesPosition && !matchesStyle) {
        return false;
      }
    }
    
    // Expertise area
    if (filters.expertiseArea) {
      const expertiseIds = mentor.expertise_areas?.map(area => area.id) || [];
      if (!expertiseIds.includes(parseInt(filters.expertiseArea))) {
        return false;
      }
    }
    
    // Years of experience
    if (filters.yearsExperience) {
      const minYears = parseInt(filters.yearsExperience);
      if (mentor.experience_years < minYears) {
        return false;
      }
    }
    
    // Company
    if (filters.company && !mentor.alumni.current_company?.name.toLowerCase().includes(filters.company.toLowerCase())) {
      return false;
    }
    
    // Availability
    if (filters.availabilityOnly && !mentor.is_available) {
      return false;
    }
    
    return true;
  });
  
  if (loading) {
    return <div className="loading">Loading mentors...</div>;
  }
  
  return (
    <div className="mentor-search-page">
      <div className="page-header">
        <h1>Find a Mentor</h1>
        <p>Connect with experienced professionals who can guide your career journey</p>
      </div>
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}
      
      <div className="mentor-content">
        <div className="filters-sidebar">
          <div className="filter-section">
            <h3>Search</h3>
            <input
              type="text"
              placeholder="Search by name, company, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-section">
            <h3>Expertise Area</h3>
            <select
              name="expertiseArea"
              value={filters.expertiseArea}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Expertise Areas</option>
              {expertiseAreas.map(area => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-section">
            <h3>Minimum Experience</h3>
            <select
              name="yearsExperience"
              value={filters.yearsExperience}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Any Experience</option>
              <option value="3">3+ years</option>
              <option value="5">5+ years</option>
              <option value="10">10+ years</option>
              <option value="15">15+ years</option>
            </select>
          </div>
          
          <div className="filter-section">
            <h3>Company</h3>
            <input
              type="text"
              name="company"
              placeholder="Filter by company..."
              value={filters.company}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>
          
          <div className="filter-section">
            <h3>Availability</h3>
            <div className="filter-checkbox">
              <input
                type="checkbox"
                id="availabilityOnly"
                name="availabilityOnly"
                checked={filters.availabilityOnly}
                onChange={handleFilterChange}
              />
              <label htmlFor="availabilityOnly">Show Available Mentors Only</label>
            </div>
          </div>
          
          <button onClick={resetFilters} className="reset-filters-btn">
            Reset Filters
          </button>
        </div>
        
        <div className="mentors-list-container">
          <div className="results-info">
            <p>{filteredMentors.length} {filteredMentors.length === 1 ? 'mentor' : 'mentors'} found</p>
            <Link to="/alumni" className="view-all-alumni-link">
              <i className="fas fa-users"></i> View All Alumni
            </Link>
          </div>
          
          {filteredMentors.length === 0 ? (
            <div className="no-results">
              <p>No mentors match your filters.</p>
              <button onClick={resetFilters} className="btn-primary">Reset Filters</button>
            </div>
          ) : (
            <div className="mentors-grid">
              {filteredMentors.map(mentor => (
                <div key={mentor.id} className="mentor-card">
                  <AlumniCard alumni={mentor.alumni} showMentorInfo={true} />
                  
                  <div className="mentor-details">
                    <div className="mentor-stats">
                      <div className="mentor-stat">
                        <span className="stat-label">Experience</span>
                        <span className="stat-value">{mentor.experience_years} years</span>
                      </div>
                      <div className="mentor-stat">
                        <span className="stat-label">Mentees</span>
                        <span className="stat-value">{mentor.current_mentee_count}/{mentor.max_mentees}</span>
                      </div>
                      <div className="mentor-stat">
                        <span className="stat-label">Status</span>
                        <span className={`status-badge ${mentor.is_available ? 'available' : 'unavailable'}`}>
                          {mentor.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mentor-expertise">
                      <h4>Expertise Areas</h4>
                      <div className="expertise-tags">
                        {mentor.expertise_areas.map(area => (
                          <span key={area.id} className="expertise-tag">{area.name}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mentorship-style">
                      <h4>Mentorship Style</h4>
                      <p>{mentor.mentorship_style}</p>
                    </div>
                    
                    {mentor.is_available && (
                      <Link to={`/mentors/${mentor.id}/request`} className="btn-request-mentorship">
                        Request Mentorship
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorSearch;