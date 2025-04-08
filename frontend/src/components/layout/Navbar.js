import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Close dropdown when route changes
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">CareerAI</span>
        </Link>
        
        <div className="menu-icon" onClick={toggleMenu}>
          <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'} />
        </div>
        
        <ul className={isMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          {isAuthenticated ? (
            // Links for authenticated users
            <>
              <li className="nav-item">
                <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'nav-link active' : 'nav-link'}>
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/courses" className={location.pathname.startsWith('/courses') ? 'nav-link active' : 'nav-link'}>
                  Courses
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/jobs" className={location.pathname.startsWith('/jobs') ? 'nav-link active' : 'nav-link'}>
                  Jobs
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/resume" className={location.pathname.startsWith('/resume') ? 'nav-link active' : 'nav-link'}>
                  Resume
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/learning-path" className={location.pathname.startsWith('/learning-path') ? 'nav-link active' : 'nav-link'}>
                  Learning Path
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/alumni" className={location.pathname.startsWith('/alumni') ? 'nav-link active' : 'nav-link'}>
                  Alumni
                </Link>
              </li>
              <li className="nav-item dropdown" ref={dropdownRef}>
                <div className="nav-link dropdown-toggle" onClick={toggleDropdown}>
                  <img 
                    src={user?.profile_image || 'https://via.placeholder.com/30'} 
                    alt="Profile" 
                    className="avatar-small"
                  />
                  <span>{user?.first_name || user?.email}</span>
                  <i className={`fas fa-angle-${isDropdownOpen ? 'up' : 'down'} ml-2`}></i>
                </div>
                <div className={`dropdown-menu${isDropdownOpen ? ' show' : ''}`}>
                  <Link to="/profile" className="dropdown-item">
                    <i className="fas fa-user mr-2"></i> Profile
                  </Link>
                  <Link to="/applications" className="dropdown-item">
                    <i className="fas fa-file-alt mr-2"></i> Applications
                  </Link>
                  <Link to="/saved-jobs" className="dropdown-item">
                    <i className="fas fa-bookmark mr-2"></i> Saved Jobs
                  </Link>
                  <Link to="/mentorship" className="dropdown-item">
                    <i className="fas fa-user-friends mr-2"></i> Mentorship
                  </Link>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt mr-2"></i> Logout
                  </button>
                </div>
              </li>
            </>
          ) : (
            // Links for non-authenticated users
            <>
              <li className="nav-item">
                <Link to="/login" className={location.pathname === '/login' ? 'nav-link active' : 'nav-link'}>
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link nav-btn">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;