import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import JobCard from "../common/JobCard";
import { getRecommendedJobs, saveJob, unsaveJob } from "../../services/jobService";
import "./RecommendedJobs.css";

const RecommendedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      try {
        setLoading(true);
        const data = await getRecommendedJobs();
        setJobs(data || []);
      } catch (err) {
        console.error("Error fetching recommended jobs:", err);
        setError("Failed to load recommended jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendedJobs();
  }, []);
  
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
  
  if (loading) {
    return <div className="loading">Loading recommended jobs...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="recommended-jobs">
      <div className="section-header">
        <h2>Recommended Jobs</h2>
        <Link to="/jobs" className="view-all-link">View All Jobs</Link>
      </div>
      
      {jobs.length === 0 ? (
        <div className="no-jobs-message">
          <p>No recommended jobs yet. Update your skills and preferences to get personalized job recommendations!</p>
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.slice(0, 3).map(job => (
            <JobCard 
              key={job.id || Math.random()} 
              job={job} 
              onSave={handleSaveJob}
              onUnsave={handleUnsaveJob}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedJobs;