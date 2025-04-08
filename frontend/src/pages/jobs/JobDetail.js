import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getJobById, saveJob, unsaveJob, applyForJob } from '../../services/jobService';
import { getUserResumes } from '../../services/learningService';

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch job and resumes in parallel
        const [jobData, resumesData] = await Promise.all([
          getJobById(jobId),
          getUserResumes()
        ]);
        
        setJob(jobData);
        setResumes(resumesData);
        
        // Set first resume as default if available
        if (resumesData.length > 0) {
          setSelectedResume(resumesData[0].id);
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [jobId]);

  const handleSaveToggle = async () => {
    try {
      if (job.is_saved) {
        await unsaveJob(job.id);
      } else {
        await saveJob(job.id);
      }
      
      // Update local state
      setJob({
        ...job,
        is_saved: !job.is_saved
      });
    } catch (err) {
      console.error('Error toggling save status:', err);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    
    if (!selectedResume) {
      alert('Please select a resume or upload a new one.');
      return;
    }
    
    try {
      setApplying(true);
      
      const applicationData = {
        resume: selectedResume,
        cover_letter: coverLetter
      };
      
      await applyForJob(job.id, applicationData);
      
      // Update local state
      setJob({
        ...job,
        has_applied: true
      });
      
      // Hide form
      setShowApplyForm(false);
      
      // Show success message
      alert('Application submitted successfully!');
    } catch (err) {
      console.error('Error submitting application:', err);
      alert('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format salary range
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary not specified';
    if (min && !max) return `$${min.toLocaleString()}+`;
    if (!min && max) return `Up to $${max.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  if (loading) {
    return <div className="loading">Loading job details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/jobs')} className="btn-primary">
          Back to Jobs
        </button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="not-found-container">
        <h2>Job Not Found</h2>
        <p>The job you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/jobs')} className="btn-primary">
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="job-detail-page">
      <div className="job-detail-container">
        <div className="job-detail-header">
          <Link to="/jobs" className="back-link">
            <i className="fas fa-arrow-left"></i> Back to Jobs
          </Link>
          
          <div className="job-title-section">
            <div className="company-logo">
              <img 
                src={job.company?.logo || 'https://via.placeholder.com/80?text=Logo'} 
                alt={job.company?.name} 
              />
            </div>
            
            <div className="job-title-content">
              <h1>{job.title}</h1>
              <div className="company-name">{job.company?.name}</div>
              <div className="job-meta">
                <span className="job-location">
                  <i className="fas fa-map-marker-alt"></i> {job.location?.name}
                  {job.is_remote && <span className="remote-badge">Remote</span>}
                </span>
                <span className="job-posted">
                  <i className="far fa-calendar-alt"></i> Posted {formatDate(job.posted_at)}
                </span>
              </div>
            </div>
            
            <div className="job-actions">
              <button 
                className={`btn-save ${job.is_saved ? 'saved' : ''}`}
                onClick={handleSaveToggle}
              >
                <i className={job.is_saved ? 'fas fa-bookmark' : 'far fa-bookmark'}></i>
                {job.is_saved ? 'Saved' : 'Save'}
              </button>
              
              {!job.has_applied ? (
                <button 
                  className="btn-apply"
                  onClick={() => setShowApplyForm(true)}
                >
                  Apply Now
                </button>
              ) : (
                <span className="applied-badge">
                  <i className="fas fa-check-circle"></i> Applied
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="job-detail-content">
          <div className="job-main-content">
            <div className="job-overview">
              <h2>Job Overview</h2>
              <div className="overview-grid">
                <div className="overview-item">
                  <div className="overview-icon">
                    <i className="fas fa-briefcase"></i>
                  </div>
                  <div className="overview-content">
                    <div className="overview-label">Employment Type</div>
                    <div className="overview-value">{job.employment_type?.name}</div>
                  </div>
                </div>
                
                <div className="overview-item">
                  <div className="overview-icon">
                    <i className="fas fa-money-bill-wave"></i>
                  </div>
                  <div className="overview-content">
                    <div className="overview-label">Salary Range</div>
                    <div className="overview-value">{formatSalary(job.salary_min, job.salary_max)}</div>
                  </div>
                </div>
                
                <div className="overview-item">
                  <div className="overview-icon">
                    <i className="fas fa-user-graduate"></i>
                  </div>
                  <div className="overview-content">
                    <div className="overview-label">Experience</div>
                    <div className="overview-value">
                      {job.experience_required_years} {job.experience_required_years === 1 ? 'year' : 'years'} required
                    </div>
                  </div>
                </div>
                
                <div className="overview-item">
                  <div className="overview-icon">
                    <i className="far fa-clock"></i>
                  </div>
                  <div className="overview-content">
                    <div className="overview-label">Application Status</div>
                    <div className="overview-value">
                      {job.application_status === 'open' ? (
                        <span className="status-open">Open</span>
                      ) : (
                        <span className="status-closed">Closed</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="job-description">
              <h2>Job Description</h2>
              <div className="description-content">
                <p>{job.description}</p>
              </div>
            </div>
            
            <div className="job-responsibilities">
              <h2>Responsibilities</h2>
              <div className="responsibilities-content">
                <p>{job.responsibilities}</p>
              </div>
            </div>
            
            <div className="job-requirements">
              <h2>Requirements</h2>
              <div className="requirements-content">
                <p>{job.requirements}</p>
              </div>
            </div>
            
            <div className="job-skills">
              <h2>Required Skills</h2>
              <div className="skills-tags">
                {job.required_skills?.map(skill => (
                  <span key={skill.id} className="skill-tag">{skill.name}</span>
                ))}
              </div>
              
              {job.preferred_skills && job.preferred_skills.length > 0 && (
                <>
                  <h3>Preferred Skills</h3>
                  <div className="skills-tags preferred">
                    {job.preferred_skills.map(skill => (
                      <span key={skill.id} className="skill-tag preferred">{skill.name}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {showApplyForm && !job.has_applied && (
              <div className="application-form-container">
                <h2>Apply for this job</h2>
                <form onSubmit={handleApply} className="application-form">
                  <div className="form-group">
                    <label htmlFor="resume">Select Resume</label>
                    {resumes.length > 0 ? (
                      <select
                        id="resume"
                        value={selectedResume}
                        onChange={(e) => setSelectedResume(e.target.value)}
                        required
                      >
                        <option value="">Select a resume</option>
                        {resumes.map(resume => (
                          <option key={resume.id} value={resume.id}>
                            {resume.title} (v{resume.version})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="no-resumes">
                        <p>You don't have any resumes uploaded.</p>
                        <Link to="/resume" className="btn-secondary">
                          Upload Resume
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="cover-letter">Cover Letter (Optional)</label>
                    <textarea
                      id="cover-letter"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Explain why you're a good fit for this role..."
                      rows="6"
                    ></textarea>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-cancel"
                      onClick={() => setShowApplyForm(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-submit"
                      disabled={applying || !selectedResume}
                    >
                      {applying ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
          
          <div className="job-sidebar">
            <div className="company-info">
              <h3>About the Company</h3>
              <div className="company-card">
                <div className="company-header">
                  <div className="company-logo-large">
                    <img 
                      src={job.company?.logo || 'https://via.placeholder.com/120?text=Logo'} 
                      alt={job.company?.name} 
                    />
                  </div>
                  <h4>{job.company?.name}</h4>
                </div>
                <div className="company-location">
                  <i className="fas fa-map-marker-alt"></i> {job.location?.name}
                </div>
                {/* In a real application, you would add company description, size, etc. */}
                <a href={`https://www.google.com/search?q=${job.company?.name}`} target="_blank" rel="noreferrer" className="company-website">
                  <i className="fas fa-external-link-alt"></i> Learn more
                </a>
              </div>
            </div>
            
            <div className="similar-jobs">
              <h3>Similar Jobs</h3>
              <div className="similar-jobs-list">
                <p className="placeholder-text">Similar job recommendations will appear here based on this job's skills and requirements.</p>
                {/* In a real application, you would fetch and display similar jobs */}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .job-detail-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        
        .job-detail-container {
          background-color: var(--white);
          border-radius: 0.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        
        .job-detail-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--gray-200);
        }
        
        .back-link {
          display: inline-flex;
          align-items: center;
          color: var(--gray-600);
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          text-decoration: none;
        }
        
        .back-link i {
          margin-right: 0.5rem;
        }
        
        .back-link:hover {
          color: var(--primary);
        }
        
        .job-title-section {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
        }
        
        .company-logo {
          width: 80px;
          height: 80px;
          border-radius: 0.5rem;
          overflow: hidden;
          background-color: var(--gray-100);
          flex-shrink: 0;
        }
        
        .company-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        .job-title-content {
          flex: 1;
        }
        
        .job-title-content h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 0.5rem;
        }
        
        .company-name {
          font-size: 1.125rem;
          color: var(--gray-700);
          margin-bottom: 0.75rem;
        }
        
        .job-meta {
          display: flex;
          gap: 1.5rem;
          color: var(--gray-600);
          font-size: 0.875rem;
        }
        
        .job-meta i {
          margin-right: 0.375rem;
          color: var(--gray-500);
        }
        
        .remote-badge {
          background-color: #e3f2fd;
          color: #1976d2;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          margin-left: 0.5rem;
        }
        
        .job-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .btn-save,
        .btn-apply {
          padding: 0.625rem 1.25rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          border: none;
        }
        
        .btn-save {
          background-color: var(--gray-100);
          color: var(--gray-700);
          border: 1px solid var(--gray-300);
        }
        
        .btn-save:hover {
          background-color: var(--gray-200);
        }
        
        .btn-save.saved {
          background-color: #e3f2fd;
          color: #1976d2;
          border-color: #1976d2;
        }
        
        .btn-apply {
          background-color: var(--primary);
          color: white;
        }
        
        .btn-apply:hover {
          background-color: var(--primary-hover);
        }
        
        .applied-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background-color: #e8f5e9;
          color: #2e7d32;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .job-detail-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          padding: 1.5rem;
        }
        
        @media (min-width: 992px) {
          .job-detail-content {
            grid-template-columns: 2fr 1fr;
          }
        }
        
        .job-overview {
          margin-bottom: 2rem;
        }
        
        .job-overview h2,
        .job-description h2,
        .job-responsibilities h2,
        .job-requirements h2,
        .job-skills h2,
        .application-form-container h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--gray-200);
        }
        
        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1.5rem;
        }
        
        .overview-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .overview-icon {
          width: 40px;
          height: 40px;
          background-color: var(--gray-100);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          font-size: 1.25rem;
        }
        
        .overview-label {
          font-size: 0.75rem;
          color: var(--gray-600);
          margin-bottom: 0.25rem;
        }
        
        .overview-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-800);
        }
        
        .status-open {
          color: #2e7d32;
        }
        
        .status-closed {
          color: #c62828;
        }
        
        .job-description,
        .job-responsibilities,
        .job-requirements {
          margin-bottom: 2rem;
        }
        
        .description-content,
        .responsibilities-content,
        .requirements-content {
          font-size: 0.875rem;
          color: var(--gray-700);
          line-height: 1.6;
        }
        
        .description-content p,
        .responsibilities-content p,
        .requirements-content p {
          margin-bottom: 1rem;
        }
        
        .job-skills {
          margin-bottom: 2rem;
        }
        
        .job-skills h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-800);
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .skills-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .skill-tag {
          background-color: var(--gray-100);
          color: var(--gray-700);
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .skill-tag.preferred {
          background-color: #e3f2fd;
          color: #1976d2;
        }
        
        .application-form-container {
          margin-top: 2rem;
          padding: 1.5rem;
          background-color: var(--gray-50);
          border-radius: 0.5rem;
          border: 1px solid var(--gray-200);
        }
        
        .application-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-700);
        }
        
        .form-group select,
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid var(--gray-300);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          width: 100%;
        }
        
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.1);
        }
        
        .no-resumes {
          padding: 1rem;
          background-color: var(--gray-100);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: var(--gray-700);
          text-align: center;
        }
        
        .no-resumes p {
          margin-bottom: 0.75rem;
        }
        
        .btn-secondary {
          display: inline-block;
          padding: 0.5rem 1rem;
          background-color: var(--gray-200);
          color: var(--gray-700);
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        
        .btn-secondary:hover {
          background-color: var(--gray-300);
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .btn-cancel,
        .btn-submit {
          padding: 0.75rem 1.5rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }
        
        .btn-cancel {
          background-color: var(--gray-200);
          color: var(--gray-700);
        }
        
        .btn-cancel:hover {
          background-color: var(--gray-300);
        }
        
        .btn-submit {
          background-color: var(--primary);
          color: white;
        }
        
        .btn-submit:hover {
          background-color: var(--primary-hover);
        }
        
        .btn-submit:disabled {
          background-color: var(--gray-400);
          cursor: not-allowed;
        }
        
        .job-sidebar h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 1rem;
        }
        
        .company-info,
        .similar-jobs {
          background-color: var(--gray-50);
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .company-card {
          text-align: center;
        }
        
        .company-header {
          margin-bottom: 1rem;
        }
        
        .company-logo-large {
          width: 100px;
          height: 100px;
          border-radius: 0.5rem;
          overflow: hidden;
          background-color: var(--white);
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--gray-200);
        }
        
        .company-logo-large img {
          width: 80%;
          height: 80%;
          object-fit: contain;
        }
        
        .company-header h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--gray-900);
        }
        
        .company-location {
          font-size: 0.875rem;
          color: var(--gray-600);
          margin-bottom: 1.5rem;
        }
        
        .company-website {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background-color: var(--white);
          color: var(--primary);
          border: 1px solid var(--primary);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        
        .company-website:hover {
          background-color: var(--primary);
          color: white;
        }
        
        .placeholder-text {
          font-size: 0.875rem;
          color: var(--gray-500);
          font-style: italic;
          text-align: center;
          padding: 1rem;
        }
        
        .error-container,
        .not-found-container {
          max-width: 600px;
          margin: 4rem auto;
          text-align: center;
          padding: 2rem;
          background-color: var(--white);
          border-radius: 0.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .error-container h2,
        .not-found-container h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 1rem;
        }
        
        .error-container p,
        .not-found-container p {
          font-size: 1rem;
          color: var(--gray-600);
          margin-bottom: 1.5rem;
        }
        
        .error-message {
          padding: 1rem;
          background-color: #feeaea;
          border: 1px solid #f5c6cb;
          border-radius: 0.375rem;
          color: #721c24;
          margin-bottom: 1.5rem;
        }
        
        .btn-primary {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: var(--primary);
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: background-color 0.3s ease;
        }
        
        .btn-primary:hover {
          background-color: var(--primary-hover);
          color: white;
        }
        
        @media (max-width: 768px) {
          .job-title-section {
            flex-direction: column;
          }
          
          .job-actions {
            flex-direction: row;
            margin-top: 1rem;
          }
          
          .overview-grid {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .btn-cancel,
          .btn-submit {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default JobDetail;