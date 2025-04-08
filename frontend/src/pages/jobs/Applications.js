import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserApplications, updateApplicationStatus } from '../../services/jobService';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getUserApplications();
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load your applications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      
      // Update the application status in the local state
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      console.error('Error updating application status:', err);
      alert('Failed to update application status. Please try again.');
    }
  };

  // Filter applications by status
  const filteredApplications = applications.filter(app => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.applied_at) - new Date(a.applied_at);
    } else if (sortOrder === 'oldest') {
      return new Date(a.applied_at) - new Date(b.applied_at);
    }
    return 0;
  });

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'applied': return 'status-applied';
      case 'screening': return 'status-screening';
      case 'interview': return 'status-interview';
      case 'technical_test': return 'status-technical';
      case 'offer': return 'status-offer';
      case 'rejected': return 'status-rejected';
      case 'accepted': return 'status-accepted';
      case 'withdrawn': return 'status-withdrawn';
      default: return 'status-default';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading">Loading your applications...</div>;
  }

  return (
    <div className="applications-page">
      <div className="page-header">
        <h1>Job Applications</h1>
        <p>Track and manage your job applications</p>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <div className="applications-filters">
        <div className="filter-group">
          <label>Status Filter:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Applications</option>
            <option value="applied">Applied</option>
            <option value="screening">Screening</option>
            <option value="interview">Interview</option>
            <option value="technical_test">Technical Test</option>
            <option value="offer">Offer</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By:</label>
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="no-applications">
          <p>You haven't applied to any jobs yet.</p>
          <Link to="/jobs" className="btn-primary">Explore Jobs</Link>
        </div>
      ) : (
        <>
          <div className="applications-stats">
            <div className="stat-card">
              <div className="stat-value">{applications.length}</div>
              <div className="stat-label">Total Applications</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {applications.filter(app => ['interview', 'technical_test', 'offer'].includes(app.status)).length}
              </div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {applications.filter(app => app.status === 'offer').length}
              </div>
              <div className="stat-label">Offers</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {applications.filter(app => app.status === 'rejected').length}
              </div>
              <div className="stat-label">Rejections</div>
            </div>
          </div>

          <div className="applications-table-container">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Position</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedApplications.map(application => (
                  <tr key={application.id}>
                    <td>
                      <div className="company-cell">
                        <div className="company-logo">
                          <img 
                            src={application.job?.company?.logo || 'https://via.placeholder.com/40?text=Logo'} 
                            alt={application.job?.company?.name || 'Company'} 
                          />
                        </div>
                        <div className="company-name">
                          {application.job?.company?.name || 'Company Name'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <Link to={`/jobs/${application.job?.id}`} className="job-title">
                        {application.job?.title || 'Job Title'}
                      </Link>
                    </td>
                    <td>{formatDate(application.applied_at)}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <select 
                          value={application.status}
                          onChange={(e) => handleStatusChange(application.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="applied">Applied</option>
                          <option value="screening">Screening</option>
                          <option value="interview">Interview</option>
                          <option value="technical_test">Technical Test</option>
                          <option value="offer">Offer</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                          <option value="withdrawn">Withdrawn</option>
                        </select>
                        <Link to={`/applications/${application.id}`} className="view-details-btn">
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <style jsx>{`
        .applications-page {
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
        
        .applications-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
          background-color: var(--white);
          padding: 1rem;
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .filter-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-700);
        }
        
        .filter-select {
          padding: 0.5rem;
          border: 1px solid var(--gray-300);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: var(--gray-700);
        }
        
        .applications-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background-color: var(--white);
          padding: 1.5rem;
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          text-align: center;
        }
        
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 0.5rem;
        }
        
        .stat-label {
          font-size: 0.875rem;
          color: var(--gray-600);
        }
        
        .applications-table-container {
          background-color: var(--white);
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        
        .applications-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .applications-table th {
          text-align: left;
          padding: 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-700);
          background-color: var(--gray-50);
          border-bottom: 1px solid var(--gray-200);
        }
        
        .applications-table td {
          padding: 1rem;
          font-size: 0.875rem;
          color: var(--gray-800);
          border-bottom: 1px solid var(--gray-200);
        }
        
        .applications-table tr:last-child td {
          border-bottom: none;
        }
        
        .company-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .company-logo {
          width: 40px;
          height: 40px;
          border-radius: 0.25rem;
          overflow: hidden;
          background-color: var(--gray-100);
        }
        
        .company-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        .company-name {
          font-weight: 500;
        }
        
        .job-title {
          color: var(--primary);
          font-weight: 500;
          text-decoration: none;
        }
        
        .job-title:hover {
          text-decoration: underline;
        }
        
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .status-applied {
          background-color: #e3f2fd;
          color: #1976d2;
        }
        
        .status-screening {
          background-color: #ede7f6;
          color: #5e35b1;
        }
        
        .status-interview {
          background-color: #fff8e1;
          color: #f57f17;
        }
        
        .status-technical {
          background-color: #e0f7fa;
          color: #00838f;
        }
        
        .status-offer {
          background-color: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-accepted {
          background-color: #e0f2f1;
          color: #00897b;
        }
        
        .status-rejected {
          background-color: #fce4ec;
          color: #c2185b;
        }
        
        .status-withdrawn {
          background-color: #f5f5f5;
          color: #757575;
        }
        
        .actions-cell {
          display: flex;
          gap: 0.5rem;
        }
        
        .status-select {
          padding: 0.375rem;
          border: 1px solid var(--gray-300);
          border-radius: 0.25rem;
          font-size: 0.75rem;
        }
        
        .view-details-btn {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          background-color: var(--primary);
          color: white;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-decoration: none;
        }
        
        .view-details-btn:hover {
          background-color: var(--primary-hover);
        }
        
        .no-applications {
          background-color: var(--white);
          padding: 3rem;
          text-align: center;
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .no-applications p {
          margin-bottom: 1.5rem;
          color: var(--gray-600);
        }
        
        .btn-primary {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: var(--primary);
          color: white;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
        }
        
        .btn-primary:hover {
          background-color: var(--primary-hover);
        }
        
        @media (max-width: 768px) {
          .applications-table {
            display: block;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default Applications;