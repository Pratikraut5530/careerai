import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourseCard from '../../components/common/CourseCard';
import { getCourses, getCourseCategories } from '../../services/courseService';
import './CourseCatalog.css';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Parameter to force a refresh from the API sources
        const refreshParam = {
          refresh: true
        };
        
        // Fetch categories and courses in parallel
        const [coursesData, categoriesData] = await Promise.all([
          getCourses(refreshParam),
          getCourseCategories()
        ]);
        
        setCourses(coursesData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Apply filters
  const filteredCourses = courses.filter(course => {
    // Category filter
    if (selectedCategory && course.category?.id !== parseInt(selectedCategory)) {
      return false;
    }
    
    // Difficulty filter
    if (selectedDifficulty && course.difficulty_level !== selectedDifficulty) {
      return false;
    }
    
    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term) ||
        course.instructor_name.toLowerCase().includes(term) ||
        (course.category_name && course.category_name.toLowerCase().includes(term))
      );
    }
    
    return true;
  });
  
  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSearchTerm('');
  };
  
  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }
  
  return (
    <div className="course-catalog-page">
      <div className="catalog-header">
        <h1>Course Catalog</h1>
        <p>Browse our extensive collection of courses to accelerate your career</p>
      </div>
      
      <div className="catalog-content">
        <div className="filters-sidebar">
          <div className="filter-section">
            <h3>Search</h3>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-section">
            <h3>Categories</h3>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-section">
            <h3>Difficulty Level</h3>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="filter-select"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <button onClick={resetFilters} className="reset-filters-btn">
            Reset Filters
          </button>
        </div>
        
        <div className="courses-grid-container">
          <div className="results-info">
            <p>{filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found</p>
            <div className="sort-options">
              <label htmlFor="sort-by">Sort by:</label>
              <select id="sort-by" className="sort-select">
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="highest">Highest Rated</option>
              </select>
            </div>
          </div>
          
          {filteredCourses.length === 0 ? (
            <div className="no-results">
              <p>No courses match your filters.</p>
              <button onClick={resetFilters} className="btn-primary">Reset Filters</button>
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
          
          {filteredCourses.length > 0 && (
            <div className="pagination">
              <button className="pagination-btn active">1</button>
              <button className="pagination-btn">2</button>
              <button className="pagination-btn">3</button>
              <button className="pagination-btn next">
                Next <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCatalog; 