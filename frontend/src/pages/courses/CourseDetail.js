import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseById, enrollInCourse, submitCourseReview } from '../../services/courseService';
import './CourseDetail.css';

const CourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Review form states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await getCourseById(courseId);
        setCourse(data);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load the course. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [courseId]);
  
  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await enrollInCourse(courseId);
      
      // Update local state
      setCourse({
        ...course,
        is_enrolled: true
      });
      
      // Show success message
      alert('Successfully enrolled in the course!');
    } catch (err) {
      console.error('Error enrolling in course:', err);
      alert('Failed to enroll in the course. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };
  
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!reviewComment.trim()) {
      alert('Please add a comment for your review');
      return;
    }
    
    try {
      setSubmittingReview(true);
      
      const reviewData = {
        rating: reviewRating,
        comment: reviewComment
      };
      
      const response = await submitCourseReview(courseId, reviewData);
      
      // Update the course state with the new review
      setCourse({
        ...course,
        reviews: [...(course.reviews || []), response]
      });
      
      // Reset form
      setReviewRating(5);
      setReviewComment('');
      setShowReviewForm(false);
      
      // Show success message
      alert('Your review has been submitted successfully!');
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading course details...</div>;
  }
  
  if (error) {
    return (
      <div className="course-detail-page">
        <div className="error-message">{error}</div>
        <Link to="/courses" className="back-link">
          <i className="fas fa-arrow-left"></i> Back to Courses
        </Link>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="course-detail-page">
        <div className="not-found-message">
          <h2>Course Not Found</h2>
          <p>The course you're looking for doesn't exist or has been removed.</p>
          <Link to="/courses" className="btn-primary">Browse Courses</Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="course-detail-page">
      <div className="course-header">
        <div className="course-header-content">
          <div className="breadcrumbs">
            <Link to="/courses">Courses</Link> / {course.title}
          </div>
          
          <h1 className="course-title">{course.title}</h1>
          
          <div className="course-meta">
            <span className="course-category">{course.category_name}</span>
            <span className="course-difficulty">{course.difficulty_level}</span>
            <span className="course-duration">{course.duration_in_weeks} weeks</span>
          </div>
          
          <div className="course-rating">
            {course.average_rating ? (
              <>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={star <= Math.round(course.average_rating) ? 'filled' : ''}>★</span>
                  ))}
                </div>
                <span className="rating-text">
                  {course.average_rating.toFixed(1)} ({course.total_reviews} {course.total_reviews === 1 ? 'review' : 'reviews'})
                </span>
              </>
            ) : (
              <span className="no-ratings">No ratings yet</span>
            )}
          </div>
          
          <p className="course-instructor">
            Instructor: <strong>{course.instructor_name}</strong>
          </p>
        </div>
        
        <div className="course-header-image">
          <img src={course.thumbnail || 'https://via.placeholder.com/600x400?text=Course+Image'} alt={course.title} />
        </div>
      </div>
      
      <div className="course-content">
        <div className="course-main">
          <div className="course-tabs">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'curriculum' ? 'active' : ''}`}
              onClick={() => setActiveTab('curriculum')}
            >
              Curriculum
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({course.reviews?.length || 0})
            </button>
          </div>
          
          <div className="tab-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="course-section">
                <h2>About This Course</h2>
                <div className="course-description">
                  <p>{course.description}</p>
                </div>
                
                <div className="course-highlights">
                  <h3>What You'll Learn</h3>
                  <ul className="highlights-list">
                    <li>Gain practical skills in {course.category_name}</li>
                    <li>Build real-world projects to add to your portfolio</li>
                    <li>Learn from industry experts with years of experience</li>
                    <li>Get personalized feedback on your progress</li>
                  </ul>
                </div>
                
                <div className="course-requirements">
                  <h3>Requirements</h3>
                  <ul className="requirements-list">
                    {course.difficulty_level === 'beginner' ? (
                      <li>No prior experience required - perfect for beginners</li>
                    ) : course.difficulty_level === 'intermediate' ? (
                      <li>Basic knowledge of {course.category_name} concepts</li>
                    ) : (
                      <li>Solid understanding of {course.category_name} principles</li>
                    )}
                    <li>A computer with internet access</li>
                    <li>Enthusiasm and willingness to learn</li>
                  </ul>
                </div>
              </div>
            )}
            
            {/* Curriculum Tab */}
            {activeTab === 'curriculum' && (
              <div className="course-section">
                <h2>Course Curriculum</h2>
                <div className="curriculum-content">
                  {course.modules?.length > 0 ? (
                    <div className="modules-accordion">
                      {course.modules.map((module, index) => (
                        <div key={module.id} className="module-item">
                          <div className="module-header">
                            <h3>
                              <span className="module-number">Module {index + 1}:</span> {module.title}
                            </h3>
                            <div className="module-meta">
                              <span className="lesson-count">
                                {module.lessons?.length || 0} {module.lessons?.length === 1 ? 'lesson' : 'lessons'}
                              </span>
                              <i className="fas fa-chevron-down"></i>
                            </div>
                          </div>
                          
                          <div className="module-content">
                            <p className="module-description">{module.description}</p>
                            
                            {module.lessons?.length > 0 && (
                              <ul className="lessons-list">
                                {module.lessons.map(lesson => (
                                  <li key={lesson.id} className="lesson-item">
                                    <div className="lesson-info">
                                      <span className="lesson-icon">
                                        {lesson.content_type === 'video' ? (
                                          <i className="fas fa-play-circle"></i>
                                        ) : lesson.content_type === 'quiz' ? (
                                          <i className="fas fa-question-circle"></i>
                                        ) : lesson.content_type === 'assignment' ? (
                                          <i className="fas fa-tasks"></i>
                                        ) : (
                                          <i className="fas fa-file-alt"></i>
                                        )}
                                      </span>
                                      <span className="lesson-title">{lesson.title}</span>
                                    </div>
                                    <span className="lesson-duration">
                                      {lesson.estimated_time_minutes} min
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-curriculum">
                      <p>Course curriculum is being prepared. Check back soon!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="course-section">
                <h2>Student Reviews</h2>
                
                {!course.is_enrolled ? (
                  <div className="reviews-cta">
                    <p>Enroll in this course to leave a review</p>
                  </div>
                ) : showReviewForm ? (
                  <div className="review-form-container">
                    <h3>Write a Review</h3>
                    <form onSubmit={handleSubmitReview} className="review-form">
                      <div className="rating-input">
                        <label>Your Rating:</label>
                        <div className="star-rating">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className={star <= reviewRating ? 'filled' : ''}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="review-comment">Your Review:</label>
                        <textarea
                          id="review-comment"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience with this course..."
                          rows="5"
                          required
                        ></textarea>
                      </div>
                      
                      <div className="form-actions">
                        <button 
                          type="button" 
                          className="btn-cancel"
                          onClick={() => setShowReviewForm(false)}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="btn-submit"
                          disabled={submittingReview}
                        >
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : course.is_enrolled && (
                  <div className="add-review">
                    <button
                      className="btn-add-review"
                      onClick={() => setShowReviewForm(true)}
                    >
                      <i className="fas fa-pen"></i> Write a Review
                    </button>
                  </div>
                )}
                
                {course.reviews?.length > 0 ? (
                  <div className="reviews-list">
                    {course.reviews.map(review => (
                      <div key={review.id} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <span className="reviewer-name">{review.user_name}</span>
                            <span className="review-date">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="review-rating">
                            {[1, 2, 3, 4, 5].map(star => (
                              <span key={star} className={star <= review.rating ? 'filled' : ''}>★</span>
                            ))}
                          </div>
                        </div>
                        <p className="review-comment">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-reviews">
                    <p>No reviews yet. Be the first to review this course!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="course-sidebar">
          <div className="course-enrollment-card">
            {course.is_enrolled ? (
              <div className="enrolled-content">
                <div className="enrolled-status">
                  <i className="fas fa-check-circle"></i> Enrolled
                </div>
                <Link to={`/courses/${courseId}/learn`} className="btn-continue-learning">
                  Continue Learning
                </Link>
              </div>
            ) : (
              <button 
                className="btn-enroll"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now - Free'}
              </button>
            )}
            
            <div className="course-features">
              <div className="feature-item">
                <i className="fas fa-certificate"></i>
                <span>Certificate of completion</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-infinity"></i>
                <span>Full lifetime access</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-mobile-alt"></i>
                <span>Access on mobile and desktop</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-graduation-cap"></i>
                <span>{course.duration_in_weeks}-week curriculum</span>
              </div>
            </div>
            
            <div className="share-course">
              <p>Share this course:</p>
              <div className="social-share">
                <a href="#" className="social-btn">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="social-btn">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="social-btn">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="#" className="social-btn">
                  <i className="fas fa-envelope"></i>
                </a>
              </div>
            </div>
          </div>
          
          {/* Similar Courses */}
          <div className="similar-courses">
            <h3>Similar Courses</h3>
            <div className="similar-courses-list">
              <p className="placeholder-text">Similar course recommendations will appear here based on your interests and this course's content.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;