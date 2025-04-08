import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { uploadResume, getUserResumes } from '../../services/learningService';
import './Learning.css';

const ResumeUpload = () => {
  const [resumes, setResumes] = useState([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const data = await getUserResumes();
      setResumes(data);
    } catch (err) {
      console.error('Error fetching resumes:', err);
      setError('Failed to load your resumes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a title for your resume.');
      return;
    }
    
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      setSuccess(false);
      
      await uploadResume({ title, file });
      
      setTitle('');
      setFile(null);
      setSuccess(true);
      
      // Refresh the resume list
      fetchResumes();
      
      // Reset the file input
      const fileInput = document.getElementById('resume-file');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      console.error('Error uploading resume:', err);
      setError('Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="resume-page">
      <div className="page-header">
        <h1>Resume Builder</h1>
        <p>Upload your resume for AI analysis and improvement suggestions</p>
      </div>
      
      <div className="page-content">
        <div className="upload-section">
          <h2>Upload New Resume</h2>
          
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <i className="fas fa-check-circle"></i> Resume uploaded successfully!
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-group">
              <label htmlFor="resume-title">Resume Title</label>
              <input
                type="text"
                id="resume-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Software Engineer Resume 2025"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="resume-file">Resume File (PDF or DOCX)</label>
              <input
                type="file"
                id="resume-file"
                onChange={handleFileChange}
                accept=".pdf,.docx"
                required
              />
              <small>Max file size: 5MB</small>
            </div>
            
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Resume'}
            </button>
          </form>
        </div>
        
        <div className="resumes-section">
          <h2>Your Resumes</h2>
          
          {loading ? (
            <div className="loading">Loading your resumes...</div>
          ) : resumes.length === 0 ? (
            <div className="no-data-message">
              <p>You haven't uploaded any resumes yet.</p>
            </div>
          ) : (
            <div className="resumes-list">
              {resumes.map(resume => (
                <div key={resume.id} className="resume-item">
                  <div className="resume-icon">
                    <i className="fas fa-file-alt"></i>
                  </div>
                  <div className="resume-details">
                    <h3>{resume.title}</h3>
                    <div className="resume-meta">
                      <span className="resume-version">Version {resume.version}</span>
                      <span className="resume-status">{resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}</span>
                      <span className="resume-date">Uploaded on {new Date(resume.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="resume-actions">
                    {resume.status === 'reviewed' && (
                      <Link to={`/resume/${resume.id}/analysis`} className="btn-view-analysis">
                        View Analysis
                      </Link>
                    )}
                    {resume.status === 'draft' && (
                      <Link to={`/resume/${resume.id}/submit`} className="btn-submit-analysis">
                        Submit for Analysis
                      </Link>
                    )}
                    <a href={resume.file} target="_blank" rel="noopener noreferrer" className="btn-download">
                      Download
                    </a>
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

export default ResumeUpload;