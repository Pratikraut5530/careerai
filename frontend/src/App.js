import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProfileCompletion from './pages/auth/ProfileCompletion';
import Dashboard from './pages/dashboard/Dashboard';
import CourseCatalog from './pages/courses/CourseCatalog';
import CourseDetail from './pages/courses/CourseDetail';
import CoursePlayer from './pages/courses/CoursePlayer';
import JobSearch from './pages/jobs/JobSearch';
import JobDetail from './pages/jobs/JobDetail';
import SavedJobs from './pages/jobs/SavedJobs';
import Applications from './pages/jobs/Applications';
import ResumeUpload from './pages/learning/ResumeUpload';
import ResumeAnalysis from './pages/learning/ResumeAnalysis';
import LearningPath from './pages/learning/LearningPath';
import AlumniDirectory from './pages/alumni/AlumniDirectory';
import MentorSearch from './pages/alumni/MentorSearch';
import AlumniEvents from './pages/alumni/AlumniEvents';
import EventDetail from './pages/alumni/EventDetail';
import MentorshipDashboard from './pages/alumni/MentorshipDashboard';
import ProfileEdit from './pages/profile/ProfileEdit';
import NotFound from './pages/NotFound';
import './App.css';

// Import the debug helper (only used in development)
import ProfileDebugHelper from './components/helpers/ProfileDebugHelper';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Checking authentication status...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: window.location }} />;
  }

  // Allow access to current route
  return children;
};

// Profile Completion Check
const ProfileRequiredRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return <div className="loading">Verifying profile status...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: window.location }} />;
  }

  // Check if profile is completed or if localStorage has a flag
  const profileCompleted = user?.is_profile_completed || localStorage.getItem('profile_completed') === 'true';
  
  if (!profileCompleted) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
};

// App component with routes
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="container">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Authentication Required Routes */}
              <Route path="/complete-profile" element={
                <ProtectedRoute>
                  <ProfileCompletion />
                </ProtectedRoute>
              } />
              
              {/* Profile Completion Required Routes */}
              <Route path="/dashboard" element={
                <ProfileRequiredRoute>
                  <Dashboard />
                </ProfileRequiredRoute>
              } />
              
              {/* Course Routes */}
              <Route path="/courses" element={
                <ProfileRequiredRoute>
                  <CourseCatalog />
                </ProfileRequiredRoute>
              } />
              <Route path="/courses/:courseId" element={
                <ProfileRequiredRoute>
                  <CourseDetail />
                </ProfileRequiredRoute>
              } />
              <Route path="/courses/:courseId/learn" element={
                <ProfileRequiredRoute>
                  <CoursePlayer />
                </ProfileRequiredRoute>
              } />
              
              {/* Job Routes */}
              <Route path="/jobs" element={
                <ProfileRequiredRoute>
                  <JobSearch />
                </ProfileRequiredRoute>
              } />
              <Route path="/jobs/:jobId" element={
                <ProfileRequiredRoute>
                  <JobDetail />
                </ProfileRequiredRoute>
              } />
              <Route path="/saved-jobs" element={
                <ProfileRequiredRoute>
                  <SavedJobs />
                </ProfileRequiredRoute>
              } />
              <Route path="/applications" element={
                <ProfileRequiredRoute>
                  <Applications />
                </ProfileRequiredRoute>
              } />
              
              {/* Learning Routes */}
              <Route path="/resume" element={
                <ProfileRequiredRoute>
                  <ResumeUpload />
                </ProfileRequiredRoute>
              } />
              <Route path="/resume/:resumeId/analysis" element={
                <ProfileRequiredRoute>
                  <ResumeAnalysis />
                </ProfileRequiredRoute>
              } />
              <Route path="/learning-path" element={
                <ProfileRequiredRoute>
                  <LearningPath />
                </ProfileRequiredRoute>
              } />
              
              {/* Alumni Routes */}
              <Route path="/alumni" element={
                <ProfileRequiredRoute>
                  <AlumniDirectory />
                </ProfileRequiredRoute>
              } />
              <Route path="/mentors" element={
                <ProfileRequiredRoute>
                  <MentorSearch />
                </ProfileRequiredRoute>
              } />
              <Route path="/alumni-events" element={
                <ProfileRequiredRoute>
                  <AlumniEvents />
                </ProfileRequiredRoute>
              } />
              <Route path="/alumni-events/:eventId" element={
                <ProfileRequiredRoute>
                  <EventDetail />
                </ProfileRequiredRoute>
              } />
              <Route path="/mentorship" element={
                <ProfileRequiredRoute>
                  <MentorshipDashboard />
                </ProfileRequiredRoute>
              } />

              <Route path="/profile" element={
                <ProfileRequiredRoute>
                  <ProfileEdit />
                </ProfileRequiredRoute>
              } />
              
              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          
          {/* Debug Helper - only visible in development */}
          <ProfileDebugHelper />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;