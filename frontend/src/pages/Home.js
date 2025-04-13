import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl } from '../utils/imageUtils';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Build Your Career with AI-Powered Guidance</h1>
          <p>CareerAI helps students and job seekers find the right path, build skills, and land their dream jobs.</p>
          <div className="hero-buttons">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">Get Started</Link>
                <Link to="/login" className="btn btn-secondary">Login</Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-image">
          <img src={getImageUrl('general', 'hero-image')} alt="CareerAI platform" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>How CareerAI Helps You Succeed</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h3>Personalized Learning Paths</h3>
            <p>Get custom course recommendations based on your career goals and current skill level.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-search"></i>
            </div>
            <h3>AI-Powered Job Matching</h3>
            <p>Find jobs that match your skills, experience, and preferences with intelligent recommendations.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-file-alt"></i>
            </div>
            <h3>Resume Analysis</h3>
            <p>Get detailed feedback and improvement suggestions for your resume from our AI.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-users"></i>
            </div>
            <h3>Alumni Network</h3>
            <p>Connect with alumni mentors for guidance, referrals, and real-world insights.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2>Your Path to Success</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Your Profile</h3>
            <p>Tell us about your education, skills, and career interests.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Explore Courses & Jobs</h3>
            <p>Discover personalized recommendations for your career journey.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Upload & Improve Resume</h3>
            <p>Get AI analysis and actionable suggestions to stand out.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Apply & Connect</h3>
            <p>Apply for jobs and connect with mentors who can help you advance.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2>Success Stories</h2>
        <div className="testimonials-carousel">
          <div className="testimonial">
            <div className="testimonial-content">
              <p>"CareerAI helped me identify the skills I needed to land my dream job in tech. The personalized learning path and resume feedback made all the difference."</p>
            </div>
            <div className="testimonial-author">
              <img src={getImageUrl('testimonial', 'testimonial1')} alt="Sarah J." />
              <div className="author-info">
                <h4>Sejal Parate.</h4>
                <p>Software Engineer at Priro Systems</p>
              </div>
            </div>
          </div>
          <div className="testimonial">
            <div className="testimonial-content">
              <p>"The alumni mentorship program connected me with someone who had been in my shoes. Their guidance helped me navigate the job market and secure multiple offers."</p>
            </div>
            <div className="testimonial-author">
              <img src={getImageUrl('testimonial', 'testimonial2')} alt="Michael T." />
              <div className="author-info">
                <h4>Shreya Giri</h4>
                <p>Data Analyst at Colgate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Accelerate Your Career?</h2>
        <p>Join thousands of students and professionals who are building their future with CareerAI.</p>
        <div className="cta-buttons">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          ) : (
            <Link to="/register" className="btn btn-primary">Get Started Today</Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;