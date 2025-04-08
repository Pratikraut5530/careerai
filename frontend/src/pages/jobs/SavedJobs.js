import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import JobCard from '../../components/common/JobCard';
import { getSavedJobs, unsaveJob, applyForJob } from '../../services/jobService';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchSavedJobs();
  }, []);
  
  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const data = await getSavedJobs();
      setSavedJobs(data);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
      setError('Failed to load your saved jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUnsaveJob = async (jobId) => {
    try {
      await unsaveJob(jobId);
      setSavedJobs(savedJobs.filter(job => job.job.id !== jobId));
    } catch (err) {
      console.error('Error unsaving job:', err);
      alert('Failed to remove job from saved list. Please try again.');
    }
  };
  
  const handleApplyJob = async (jobId) => {
    try {
      // Redirect to job application page
      window.location.href = `/jobs/${jobId}/apply`;
    } catch (err) {
      console.error('Error applying for job:', err);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading your saved jobs...</div>;
  }
  
  return (
    <div className="saved-jobs-page">
      <div className="page-header">
        <h1>Saved Jobs</h1>
        <p>Review and apply to jobs you've saved for later</p>
      </div>
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}
      
      <div className="saved-jobs-container">
        {savedJobs.length === 0 ? (
          <div className="no-saved-jobs">
            <i className="far fa-bookmark no-saved-icon"></i>
            <h2>No Saved Jobs</h2>
            <p>Jobs you save will appear here for easy access.</p>
            <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
          </div>
        ) : (
          <>
            <div className="saved-jobs-header">
              <div className="saved-count">
                <span className="count">{savedJobs.length}</span> saved jobs
              </div>
              <div className="saved-actions">
                <button onClick={() => window.print()} className="btn-secondary">
                  <i className="fas fa-print"></i> Print List
                </button>
              </div>
            </div>
            
            <div className="saved-jobs-list">
              {savedJobs.map(savedJob => (
                <div key={savedJob.id} className="saved-job-item">
                  <JobCard 
                    job={savedJob.job} 
                    onUnsave={handleUnsaveJob}
                  />
                  <div className="saved-date">
                    Saved on {new Date(savedJob.saved_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <style jsx>{`
        .saved-jobs-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        
        .page-header {
          margin-bottom: 2rem;
        }
        
        .page-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--gray-900);
        }
        
        .page-header p {
          color: var(--gray-600);
          font-size: 1rem;
        }
        
        .saved-jobs-container {
          background-color: var(--white);
          border-radius: 0.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
        }
        
        .no-saved-jobs {
          text-align: center;
          padding: 3rem 1rem;
        }
        
        .no-saved-icon {
          font-size: 4rem;
          color: var(--gray-300);
          margin-bottom: 1.5rem;
        }
        
        .no-saved-jobs h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: 0.75rem;
        }
        
        .no-saved-jobs p {
          color: var(--gray-600);
          margin-bottom: 1.5rem;
        }
        
        .saved-jobs-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--gray-200);
        }
        
        .saved-count {
          font-size: 0.875rem;
          color: var(--gray-700);
        }
        
        .saved-count .count {
          font-weight: 600;
          font-size: 1.125rem;
          color: var(--primary);
        }
        
        .btn-secondary {
          padding: 0.5rem 1rem;
          background-color: var(--gray-100);
          color: var(--gray-700);
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }
        
        .btn-secondary:hover {
          background-color: var(--gray-200);
        }
        
        .saved-jobs-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .saved-job-item {
          position: relative;
        }
        
        .saved-date {
          text-align: right;
          font-size: 0.75rem;
          color: var(--gray-500);
          margin-top: 0.5rem;
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
        
        @media print {
          .saved-actions, .job-card-save, .job-card-actions {
            display: none !important;
          }
          
          .saved-jobs-container {
            box-shadow: none;
          }
          
          .saved-jobs-header {
            border-bottom: 1px solid #000;
          }
        }
      `}</style>
    </div>
  );
};

export default SavedJobs;