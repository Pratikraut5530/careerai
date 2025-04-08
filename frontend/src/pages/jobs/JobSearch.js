import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import JobCard from '../../components/common/JobCard';
import { getJobs, saveJob, unsaveJob } from '../../services/jobService';
import { getSkills, getLocations, getCompanies } from '../../services/profileService';
import './JobSearch.css';

const JobSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // State variables
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter options
  const [skills, setSkills] = useState([]);
  const [locations, setLocations] = useState([]);
  const [companies, setCompanies] = useState([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState(queryParams.get('q') || '');
  const [selectedSkills, setSelectedSkills] = useState(queryParams.getAll('skill') || []);
  const [selectedLocation, setSelectedLocation] = useState(queryParams.get('location') || '');
  const [selectedCompany, setSelectedCompany] = useState(queryParams.get('company') || '');
  const [selectedExperience, setSelectedExperience] = useState(queryParams.get('exp') || '');
  const [isRemote, setIsRemote] = useState(
    queryParams.get('remote') === 'true' ? true : 
    queryParams.get('remote') === 'false' ? false : null
  );
  const [sortBy, setSortBy] = useState(queryParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(queryParams.get('page') || '1', 10));
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const jobsPerPage = 10;

  // Debounce search to prevent too many API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func.apply(null, args);
      }, delay);
    };
  };

  // Function to fetch jobs with current filters
  const fetchJobs = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      
      // Construct query params for API
      const params = {
        page,
        page_size: jobsPerPage,
        sort: sortBy,
        q: searchTerm,
        refresh: isRefresh, // Parameter to trigger fresh data from external APIs
      };
      
      // Add filter params if they exist
      if (selectedSkills.length > 0) {
        params.skill_id = selectedSkills;
      }
      
      if (selectedLocation) {
        params.location_id = selectedLocation;
      }
      
      if (selectedCompany) {
        params.company_id = selectedCompany;
      }
      
      if (selectedExperience) {
        params.experience_max = selectedExperience;
      }
      
      if (isRemote !== null) {
        params.is_remote = isRemote;
      }
      
      const data = await getJobs(params);
      
      setJobs(data.results || data);
      setTotalJobs(data.count || data.length);
      setTotalPages(Math.ceil((data.count || data.length) / jobsPerPage));
      
      // Update URL with filter parameters
      updateUrlParams();
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    page, 
    jobsPerPage, 
    sortBy, 
    searchTerm, 
    selectedSkills, 
    selectedLocation, 
    selectedCompany, 
    selectedExperience, 
    isRemote
  ]);

  // Function to update URL parameters
  const updateUrlParams = () => {
    const params = new URLSearchParams();
    
    if (searchTerm) params.set('q', searchTerm);
    if (selectedLocation) params.set('location', selectedLocation);
    if (selectedCompany) params.set('company', selectedCompany);
    if (selectedExperience) params.set('exp', selectedExperience);
    if (isRemote !== null) params.set('remote', isRemote.toString());
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (page > 1) params.set('page', page.toString());
    
    selectedSkills.forEach(skill => {
      params.append('skill', skill);
    });
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  };

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((term) => {
      setSearchTerm(term);
      setPage(1); // Reset to first page on new search
    }, 500),
    []
  );

  // Handle input change for search
  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };
  
  // Effect to load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [skillsData, locationsData, companiesData] = await Promise.all([
          getSkills(),
          getLocations(),
          getCompanies()
        ]);
        
        setSkills(skillsData);
        setLocations(locationsData);
        setCompanies(companiesData);
      } catch (err) {
        console.error('Error loading filter options:', err);
        // We don't set the main error state here to still allow job searching
      }
    };
    
    loadFilterOptions();
  }, []);
  
  // Effect to fetch jobs when filters change
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  // Handle skill selection
  const handleSkillChange = (e) => {
    const { value, checked } = e.target;
    setSelectedSkills(prevSkills => {
      const newSkills = checked 
        ? [...prevSkills, value]
        : prevSkills.filter(skill => skill !== value);
      return newSkills;
    });
    setPage(1); // Reset to first page on filter change
  };
  
  // Handle dropdown filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    switch (name) {
      case 'location':
        setSelectedLocation(value);
        break;
      case 'company':
        setSelectedCompany(value);
        break;
      case 'experience':
        setSelectedExperience(value);
        break;
      case 'sortBy':
        setSortBy(value);
        break;
      case 'remote':
        setIsRemote(value === '' ? null : value === 'true');
        break;
      default:
        break;
    }
    
    setPage(1); // Reset to first page on filter change
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSkills([]);
    setSelectedLocation('');
    setSelectedCompany('');
    setSelectedExperience('');
    setIsRemote(null);
    setSortBy('newest');
    setPage(1);
    
    // Clear the search input field
    const searchInput = document.querySelector('.search-input');
    if (searchInput) searchInput.value = '';
    
    // Update URL to remove all params
    window.history.replaceState({}, '', window.location.pathname);
  };
  
  // Refresh jobs from external APIs
  const refreshJobs = () => {
    fetchJobs(true);
  };
  
  // Handle save/unsave job
  const handleSaveJob = async (jobId) => {
    try {
      await saveJob(jobId);
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, is_saved: true } : job
        )
      );
    } catch (err) {
      console.error("Error saving job:", err);
    }
  };
  
  const handleUnsaveJob = async (jobId) => {
    try {
      await unsaveJob(jobId);
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, is_saved: false } : job
        )
      );
    } catch (err) {
      console.error("Error unsaving job:", err);
    }
  };
  
  // Pagination handlers
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="job-search-page">
      <div className="job-search-header">
        <h1>Find Your Dream Job</h1>
        <p>Browse through our curated list of job opportunities</p>
      </div>
      
      <div className="job-search-content">
        <div className="filters-sidebar">
          <div className="filter-section">
            <h3>Search</h3>
            <input
              type="text"
              placeholder="Search by title, company, or keywords..."
              defaultValue={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          
          <div className="filter-section">
            <h3>Sort By</h3>
            <select
              name="sortBy"
              value={sortBy}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="salary_high">Highest Salary</option>
              <option value="salary_low">Lowest Salary</option>
              <option value="title_asc">Title A-Z</option>
              <option value="title_desc">Title Z-A</option>
            </select>
          </div>
          
          <div className="filter-section">
            <h3>Skills</h3>
            <div className="skills-filter">
              {skills.slice(0, 10).map(skill => (
                <div key={skill.id} className="skill-checkbox">
                  <input
                    type="checkbox"
                    id={`skill-${skill.id}`}
                    value={skill.id}
                    checked={selectedSkills.includes(skill.id.toString())}
                    onChange={handleSkillChange}
                  />
                  <label htmlFor={`skill-${skill.id}`}>{skill.name}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h3>Location</h3>
            <select
              name="location"
              value={selectedLocation}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-section">
            <h3>Company</h3>
            <select
              name="company"
              value={selectedCompany}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Companies</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-section">
            <h3>Experience Required</h3>
            <select
              name="experience"
              value={selectedExperience}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Any Experience</option>
              <option value="0">Entry Level (0 years)</option>
              <option value="1">1+ year</option>
              <option value="3">3+ years</option>
              <option value="5">5+ years</option>
              <option value="10">10+ years</option>
            </select>
          </div>
          
          <div className="filter-section">
            <h3>Remote Options</h3>
            <select
              name="remote"
              value={isRemote === null ? '' : isRemote.toString()}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Any</option>
              <option value="true">Remote Only</option>
              <option value="false">On-site Only</option>
            </select>
          </div>
          
          <div className="filter-actions">
            <button onClick={resetFilters} className="reset-filters-btn">
              Reset Filters
            </button>
            <button onClick={refreshJobs} className="refresh-btn" disabled={refreshing}>
              {refreshing ? 'Refreshing...' : 'Refresh Jobs'} 
              <i className={`fas fa-sync-alt ${refreshing ? 'fa-spin' : ''}`}></i>
            </button>
          </div>
        </div>
        
        <div className="jobs-list-container">
          <div className="results-info">
            <p>
              {loading ? 'Loading jobs...' : 
               `${totalJobs} ${totalJobs === 1 ? 'job' : 'jobs'} found`}
               {refreshing && <span className="refreshing-indicator"> · Refreshing...</span>}
            </p>
            
            {!loading && jobs.length > 0 && (
              <div className="pagination-info">
                Showing {((page - 1) * jobsPerPage) + 1} - {Math.min(page * jobsPerPage, totalJobs)} of {totalJobs}
              </div>
            )}
          </div>
          
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i> {error}
              <button onClick={fetchJobs} className="retry-btn">Retry</button>
            </div>
          )}
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="no-results">
              <p>No jobs match your filters.</p>
              <button onClick={resetFilters} className="btn-primary">Reset Filters</button>
            </div>
          ) : (
            <>
              <div className="jobs-list">
                {jobs.map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onSave={handleSaveJob}
                    onUnsave={handleUnsaveJob}
                  />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn" 
                    onClick={handlePrevPage} 
                    disabled={page === 1}
                  >
                    <i className="fas fa-chevron-left"></i> Previous
                  </button>
                  
                  <div className="pagination-pages">
                    Page {page} of {totalPages}
                  </div>
                  
                  <button 
                    className="pagination-btn" 
                    onClick={handleNextPage} 
                    disabled={page === totalPages}
                  >
                    Next <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobSearch;