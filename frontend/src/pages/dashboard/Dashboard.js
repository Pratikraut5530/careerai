import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import RecommendedCourses from '../../components/dashboard/RecommendedCourses';
import RecommendedJobs from '../../components/dashboard/RecommendedJobs';
import { getUserEnrollments } from '../../services/courseService';
import { getUserApplications } from '../../services/jobService';
import { getUserResumes } from '../../services/learningService';
import { getImageUrl } from '../../utils/imageUtils';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch data in parallel
        const [enrollmentsData, applicationsData, resumesData] = await Promise.all([
          getUserEnrollments(),
          getUserApplications(),
          getUserResumes()
        ]);
        
        setEnrollments(enrollmentsData);
        setApplications(applicationsData);
        setResumes(resumesData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Calculate profile completion percentage
  const calculateProfileCompletionPercentage = () => {
    if (!user) return 100; // Default to 100% if user is null
    return user.is_profile_completed ? 100 : 0;
  };
  
  const completionPercentage = calculateProfileCompletionPercentage();
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;
  
  if (loading) {
    return <div className="loading">Loading your dashboard...</div>;
  }
  
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, {user?.first_name || 'Student'}!</h1>
        <p>Here's your CareerAI dashboard</p>
      </div>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      <div className="dashboard-grid">
        <div className="dashboard-main">
          {/* Progress Summary */}
          <div className="dashboard-card progress-summary">
            <h2>Your Progress</h2>
            <div className="progress-stats">
              <div className="stat">
                <div className="stat-value">{enrollments.length}</div>
                <div className="stat-label">Courses Enrolled</div>
              </div>
              <div className="stat">
                <div className="stat-value">{enrollments.filter(e => e.completed).length}</div>
                <div className="stat-label">Courses Completed</div>
              </div>
              <div className="stat">
                <div className="stat-value">{applications.length}</div>
                <div className="stat-label">Job Applications</div>
              </div>
              <div className="stat">
                <div className="stat-value">{resumes.length}</div>
                <div className="stat-label">Resumes</div>
              </div>
            </div>
          </div>
          
          {/* Recommended Courses */}
          <RecommendedCourses />
          
          {/* Active Enrollments */}
          <div className="dashboard-card active-enrollments">
            <div className="card-header">
              <h2>Your Courses</h2>
              <Link to="/courses" className="view-all-link">View All</Link>
            </div>
            
            {enrollments.length === 0 ? (
              <div className="no-data-message">
                <p>You haven't enrolled in any courses yet.</p>
                <Link to="/courses" className="btn-primary">Explore Courses</Link>
              </div>
            ) : (
              <div className="enrollments-list">
                {enrollments.slice(0, 3).map(enrollment => (
                  <div key={enrollment.id} className="enrollment-item">
                    <div className="enrollment-thumbnail">
                      <img 
                        src={enrollment.course?.thumbnail || getImageUrl('course', enrollment.course_title)} 
                        alt={enrollment.course_title} 
                      />
                    </div>
                    <div className="enrollment-details">
                      <h3>{enrollment.course_title}</h3>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${enrollment.progress_percentage}%` }}
                        ></div>
                      </div>
                      <div className="progress-text">
                        {enrollment.progress_percentage}% complete
                      </div>
                    </div>
                    <Link 
                      to={`/courses/${enrollment.course?.id}/learn`}
                      className="btn-continue"
                    >
                      Continue
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="dashboard-sidebar">
          {/* Profile Completion Card */}
          <div className="dashboard-card profile-completion">
            <h2>Profile Completion</h2>
            <div className="completion-progress">
              <div className="circular-progress">
                <svg viewBox="0 0 120 120">
                  <circle 
                    className="circle-bg"
                    cx="60" 
                    cy="60" 
                    r={radius}
                  />
                  <circle 
                    className="circle"
                    cx="60" 
                    cy="60" 
                    r={radius}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <div className="percentage-container">
                  <span className="percentage-value">{completionPercentage}%</span>
                  <span className="percentage-label">Completed</span>
                </div>
              </div>
            </div>
            <Link to="/profile" className="btn-update-profile">Update Profile</Link>
          </div>
          
          {/* Recommended Jobs */}
          <RecommendedJobs />
          
          {/* Recent Applications */}
          <div className="dashboard-card recent-applications">
            <div className="card-header">
              <h2>Recent Applications</h2>
              <Link to="/applications" className="view-all-link">View All</Link>
            </div>
            
            {applications.length === 0 ? (
              <div className="no-data-message">
                <p>You haven't applied to any jobs yet.</p>
                <Link to="/jobs" className="btn-primary">Explore Jobs</Link>
              </div>
            ) : (
              <div className="applications-list">
                {applications.slice(0, 3).map(application => (
                  <div key={application.id} className="application-item">
                    <div className="application-company-logo">
                      <img 
                        src={application.job?.company?.logo || getImageUrl('company', application.job?.company?.name)} 
                        alt={application.job?.company?.name} 
                      />
                    </div>
                    <div className="application-details">
                      <h3>{application.job?.title}</h3>
                      <p className="company-name">{application.job?.company?.name}</p>
                      <div className={`application-status ${application.status}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Quick Links */}
          <div className="dashboard-card quick-links">
            <h2>Quick Links</h2>
            <div className="links-grid">
              <Link to="/resume" className="quick-link">
                <i className="fas fa-file-alt"></i>
                <span>Resume Builder</span>
              </Link>
              <Link to="/learning-path" className="quick-link">
                <i className="fas fa-road"></i>
                <span>Learning Path</span>
              </Link>
              <Link to="/mentors" className="quick-link">
                <i className="fas fa-user-friends"></i>
                <span>Find Mentors</span>
              </Link>
              <Link to="/alumni-events" className="quick-link">
                <i className="fas fa-calendar-alt"></i>
                <span>Events</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;