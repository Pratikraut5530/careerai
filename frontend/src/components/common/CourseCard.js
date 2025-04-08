import React from 'react';
import { Link } from 'react-router-dom';
import './CourseCard.css';

const CourseCard = ({ course }) => {
  const {
    id,
    title,
    description,
    instructor_name,
    thumbnail,
    category_name,
    difficulty_level,
    duration_in_weeks,
    average_rating,
    total_reviews,
    is_enrolled
  } = course;

  // Get difficulty level badge color
  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'green';
      case 'intermediate':
        return 'orange';
      case 'advanced':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <div className="course-card">
      <div className="course-card-image">
        <img 
          src={thumbnail || 'https://via.placeholder.com/300x200?text=Course+Image'} 
          alt={title} 
        />
        <span className={`difficulty-badge ${getDifficultyColor(difficulty_level)}`}>
          {difficulty_level.charAt(0).toUpperCase() + difficulty_level.slice(1)}
        </span>
      </div>
      
      <div className="course-card-content">
        <div className="course-card-category">{category_name}</div>
        <h3 className="course-card-title">{title}</h3>
        <p className="course-card-description">
          {description.length > 120 ? `${description.substring(0, 120)}...` : description}
        </p>
        
        <div className="course-card-details">
          <div className="course-card-instructor">
            <i className="fas fa-chalkboard-teacher"></i> {instructor_name}
          </div>
          <div className="course-card-duration">
            <i className="far fa-clock"></i> {duration_in_weeks} {duration_in_weeks === 1 ? 'week' : 'weeks'}
          </div>
        </div>
        
        <div className="course-card-meta">
          <div className="course-card-rating">
            {average_rating ? (
              <>
                <i className="fas fa-star"></i> {average_rating.toFixed(1)}
                <span className="course-card-reviews">({total_reviews} {total_reviews === 1 ? 'review' : 'reviews'})</span>
              </>
            ) : (
              <span className="no-rating">No ratings yet</span>
            )}
          </div>
          
          <Link to={`/courses/${id}`} className="course-card-button">
            {is_enrolled ? 'Continue Learning' : 'View Course'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;