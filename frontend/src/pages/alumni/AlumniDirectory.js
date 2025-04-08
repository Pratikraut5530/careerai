import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AlumniCard from '../../components/common/AlumniCard';
import { getAlumni } from '../../services/alumniService';
import './Alumni.css';

const AlumniDirectory = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    graduationYear: '',
    company: '',
    skills: [],
    isMentor: false,
    isAvailableForReferrals: false
  });
  
  // Years for filter dropdown
  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: 10 }, (_, i) => currentYear - i);
  
  // Skills for filter (you might want to fetch these dynamically)
  const commonSkills = [
    { id: 1, name: 'React' },
    { id: 2, name: 'Python' },
    { id: 3, name: 'JavaScript' },
    { id: 4, name: 'Machine Learning' },
    { id: 5, name: 'Data Science' },
    { id: 6, name: 'Product Management' },
    { id: 7, name: 'UX Design' }
  ];
  
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setLoading(true);
        const data = await getAlumni();
        setAlumni(data);
      } catch (err) {
        console.error('Error fetching alumni:', err);
        setError('Failed to load alumni. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlumni();
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
  
  const handleSkillChange = (skillId) => {
    if (filters.skills.includes(skillId)) {
      setFilters(prev => ({
        ...prev,
        skills: prev.skills.filter(id => id !== skillId)
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        skills: [...prev.skills, skillId]
      }));
    }
  };
  
  const resetFilters = () => {
    setFilters({
      graduationYear: '',
      company: '',
      skills: [],
      isMentor: false,
      isAvailableForReferrals: false
    });
    setSearchTerm('');
  };
  
  // Apply filters and search
  const filteredAlumni = alumni.filter(alum => {
    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const fullName = `${alum.user.first_name} ${alum.user.last_name}`.toLowerCase();
      const matchesName = fullName.includes(term);
      const matchesCompany = alum.current_company?.name.toLowerCase().includes(term);
      const matchesPosition = alum.position.toLowerCase().includes(term);
      
      if (!matchesName && !matchesCompany && !matchesPosition) {
        return false;
      }
    }
    
    // Graduation year
    if (filters.graduationYear && alum.graduation_year !== parseInt(filters.graduationYear)) {
      return false;
    }
    
    // Company
    if (filters.company && !alum.current_company?.name.toLowerCase().includes(filters.company.toLowerCase())) {
      return false;
    }
    
    // Skills
    if (filters.skills.length > 0) {
      const alumSkillIds = alum.skills?.map(skill => skill.id) || [];
      const hasMatchingSkill = filters.skills.some(skillId => alumSkillIds.includes(skillId));
      
      if (!hasMatchingSkill) {
        return false;
      }
    }
    
    // Mentor filter
    if (filters.isMentor && !alum.is_mentor) {
      return false;
    }
    
    // Referrals filter
    if (filters.isAvailableForReferrals && !alum.is_available_for_referrals) {
      return false;
    }
    
    return true;
  });
  
  if (loading) {
    return <div className="loading">Loading alumni directory...</div>;
  }
  
  return (
    <div className="alumni-directory-page">
      <div className="page-header">
        <h1>Alumni Network</h1>
        <p>Connect with graduates who've gone on to successful careers</p>
      </div>
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}
      
      <div className="alumni-content">
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
            <h3>Graduation Year</h3>
            <select
              name="graduationYear"
              value={filters.graduationYear}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Years</option>
              {graduationYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
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
            <h3>Skills</h3>
            <div className="skills-filter">
              {commonSkills.map(skill => (
                <div key={skill.id} className="skill-checkbox">
                  <input
                    type="checkbox"
                    id={`skill-${skill.id}`}
                    checked={filters.skills.includes(skill.id)}
                    onChange={() => handleSkillChange(skill.id)}
                  />
                  <label htmlFor={`skill-${skill.id}`}>{skill.name}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h3>Special Filters</h3>
            <div className="special-filters">
              <div className="filter-checkbox">
                <input
                  type="checkbox"
                  id="isMentor"
                  name="isMentor"
                  checked={filters.isMentor}
                  onChange={handleFilterChange}
                />
                <label htmlFor="isMentor">Mentors Only</label>
              </div>
              <div className="filter-checkbox">
                <input
                  type="checkbox"
                  id="isAvailableForReferrals"
                  name="isAvailableForReferrals"
                  checked={filters.isAvailableForReferrals}
                  onChange={handleFilterChange}
                />
                <label htmlFor="isAvailableForReferrals">Available for Referrals</label>
              </div>
            </div>
          </div>
          
          <button onClick={resetFilters} className="reset-filters-btn">
            Reset Filters
          </button>
        </div>
        
        <div className="alumni-list-container">
          <div className="results-info">
            <p>{filteredAlumni.length} {filteredAlumni.length === 1 ? 'alumnus' : 'alumni'} found</p>
            <div className="view-actions">
              <Link to="/mentors" className="view-mentors-link">
                <i className="fas fa-user-friends"></i> View Mentors
              </Link>
              <Link to="/alumni-events" className="view-events-link">
                <i className="fas fa-calendar-alt"></i> View Alumni Events
              </Link>
            </div>
          </div>
          
          {filteredAlumni.length === 0 ? (
            <div className="no-results">
              <p>No alumni match your filters.</p>
              <button onClick={resetFilters} className="btn-primary">Reset Filters</button>
            </div>
          ) : (
            <div className="alumni-grid">
              {filteredAlumni.map(alumnus => (
                <AlumniCard key={alumnus.id} alumni={alumnus} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniDirectory;