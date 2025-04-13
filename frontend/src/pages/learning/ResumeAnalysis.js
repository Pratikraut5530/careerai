import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getResumeAnalysis } from '../../services/learningService';
import { getImageUrl } from '../../utils/imageUtils';
import './ResumeAnalysis.css';

const ResumeAnalysis = () => {
  const { resumeId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const data = await getResumeAnalysis(resumeId);
        setAnalysis(data);
      } catch (err) {
        console.error('Error fetching resume analysis:', err);
        setError('Failed to load resume analysis. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalysis();
  }, [resumeId]);
  
  if (loading) {
    return <div className="loading">Loading resume analysis...</div>;
  }
  
  if (error) {
    return (
      <div className="resume-analysis-page">
        <div className="page-header">
          <h1>Resume Analysis</h1>
          <p>AI-powered insights to improve your resume</p>
        </div>
        
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
        
        <div className="back-navigation">
          <Link to="/resume" className="btn-back">
            <i className="fas fa-arrow-left"></i> Back to Resumes
          </Link>
        </div>
      </div>
    );
  }
  
  if (!analysis) {
    return (
      <div className="resume-analysis-page">
        <div className="page-header">
          <h1>Resume Analysis</h1>
          <p>AI-powered insights to improve your resume</p>
        </div>
        
        <div className="not-found-message">
          <p>No analysis found for this resume. It may still be processing.</p>
          <Link to="/resume" className="btn-primary">Back to Resumes</Link>
        </div>
      </div>
    );
  }
  
  // Convert new lines to break tags for display
  const formatText = (text) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };
  
  return (
    <div className="resume-analysis-page">
      <div className="page-header">
        <h1>Resume Analysis</h1>
        <p>AI-powered insights to improve your resume</p>
      </div>
      
      <div className="analysis-content">
        <div className="analysis-header">
          <div className="resume-info">
            <h2>{analysis.resume?.title || 'Resume Analysis'}</h2>
            <div className="analysis-meta">
              <span className="analysis-date">
                <i className="far fa-calendar-alt"></i> Analyzed on {new Date(analysis.analyzed_at).toLocaleDateString()}
              </span>
              
              {analysis.ai_generated_score && (
                <span className="analysis-score">
                  <i className="fas fa-star"></i> Score: {analysis.ai_generated_score}/10
                </span>
              )}
            </div>
          </div>
          
          <div className="analysis-actions">
            <a 
              href={analysis.resume?.file || getImageUrl('general', 'resume')} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-secondary"
            >
              <i className="fas fa-download"></i> Download Resume
            </a>
          </div>
        </div>
        
        <div className="analysis-visualization">
          <img 
            src={getImageUrl('general', 'resume-analysis')} 
            alt="Resume Analysis Visualization" 
            className="analysis-illustration"
          />
        </div>
        
        <div className="analysis-sections">
          <div className="analysis-section">
            <h3>Overall Analysis</h3>
            <div className="section-content">
              <p>{formatText(analysis.analysis_text)}</p>
            </div>
          </div>
          
          <div className="analysis-section strengths-section">
            <h3>Strengths</h3>
            <div className="section-content">
              <p>{formatText(analysis.strengths)}</p>
            </div>
          </div>
          
          <div className="analysis-section weaknesses-section">
            <h3>Areas for Improvement</h3>
            <div className="section-content">
              <p>{formatText(analysis.weaknesses)}</p>
            </div>
          </div>
          
          <div className="analysis-section suggestions-section">
            <h3>Improvement Suggestions</h3>
            <div className="section-content">
              <p>{formatText(analysis.improvement_suggestions)}</p>
            </div>
          </div>
        </div>
        
        <div className="analysis-actions-footer">
          <Link to="/resume" className="btn-back">
            <i className="fas fa-arrow-left"></i> Back to Resumes
          </Link>
          
          <Link to="/learning-path" className="btn-primary">
            <i className="fas fa-road"></i> Create Learning Path Based on Analysis
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;