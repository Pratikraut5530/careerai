import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-content">
          <h1>404</h1>
          <h2>Site Under Development</h2>
          <p>This page is under development.Thank you for your patience</p>
          <Link to="/" className="btn-primary">Go to Home Page</Link>
        </div>
      </div>

      <style jsx>{`
        .not-found-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 200px);
          text-align: center;
          padding: 2rem 1rem;
        }
        
        .not-found-container {
          max-width: 600px;
        }
        
        .not-found-content {
          background-color: var(--white);
          border-radius: 0.5rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          padding: 3rem 2rem;
        }
        
        h1 {
          font-size: 6rem;
          font-weight: 700;
          color: var(--primary);
          line-height: 1;
          margin-bottom: 1rem;
        }
        
        h2 {
          font-size: 2rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 1.5rem;
        }
        
        p {
          font-size: 1rem;
          color: var(--gray-600);
          margin-bottom: 2rem;
        }
        
        .btn-primary {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: var(--primary);
          color: white;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background-color 0.3s ease;
        }
        
        .btn-primary:hover {
          background-color: var(--primary-hover);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default NotFound;