import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourseCard from '../common/CourseCard';
import { getRecommendedCourses } from '../../services/courseService';
import './RecommendedCourses.css';

const RecommendedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchRecommendedCourses = async () => {
      try {
        setLoading(true);
        const data = await getRecommendedCourses();
        setCourses(data);
      } catch (err) {
        console.error('Error fetching recommended courses:', err);
        setError('Failed to load recommended courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendedCourses();
  }, []);
  
  if (loading) {
    return <div className="loading">Loading recommended courses...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="recommended-courses">
      <div className="section-header">
        <h2>Recommended Courses</h2>
        <Link to="/courses" className="view-all-link">View All Courses</Link>
      </div>
      
      {courses.length === 0 ? (
        <div className="no-courses-message">
          <p>No recommended courses yet. Start by completing your profile to get personalized recommendations!</p>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.slice(0, 4).map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedCourses;