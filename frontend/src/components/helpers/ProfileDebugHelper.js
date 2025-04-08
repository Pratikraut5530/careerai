import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../../config';

/**
 * This is a debug component for troubleshooting profile completion issues
 * DO NOT use in production!
 */
const ProfileDebugHelper = () => {
  const { user, updateProfile } = useAuth();
  const [debugMessage, setDebugMessage] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  
  const toggleProfileCompletion = async () => {
    try {
      const newState = !user?.is_profile_completed;
      
      // Direct API call to patch the user data
      await axios.patch(`${API_URL}/api/auth/me/`, {
        is_profile_completed: newState
      });
      
      // Update localStorage flag for UI state
      localStorage.setItem('profile_completed', newState ? 'true' : 'false');
      
      // Update auth context
      await updateProfile({ is_profile_completed: newState });
      
      setDebugMessage(`Profile completion status set to: ${newState}`);
      
      // Reload the page to make sure all components reflect the change
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setDebugMessage(`Error: ${err.message}`);
      console.error(err);
    }
  };
  
  const checkProfileStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me/`);
      setDebugMessage(`User data from API: ${JSON.stringify(response.data)}`);
    } catch (err) {
      setDebugMessage(`Error: ${err.message}`);
      console.error(err);
    }
  };
  
  // This component should only be visible in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  if (!showDebug) {
    return (
      <div style={{ position: 'fixed', bottom: '10px', right: '10px', zIndex: 9999 }}>
        <button 
          onClick={() => setShowDebug(true)}
          style={{ 
            background: '#333', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '4px',
            padding: '5px 10px'
          }}
        >
          Debug
        </button>
      </div>
    );
  }
  
  return (
    <div 
      style={{ 
        position: 'fixed', 
        bottom: '10px', 
        right: '10px',
        background: '#f0f0f0',
        border: '1px solid #ccc',
        borderRadius: '5px',
        padding: '10px',
        width: '350px',
        zIndex: 9999,
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h4 style={{ margin: 0 }}>Profile Debug Helper</h4>
        <button 
          onClick={() => setShowDebug(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ×
        </button>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <p><strong>Profile Completed:</strong> {user?.is_profile_completed ? 'Yes' : 'No'}</p>
        <p><strong>User ID:</strong> {user?.id || 'Unknown'}</p>
      </div>
      
      <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
        <button 
          onClick={toggleProfileCompletion}
          style={{ 
            background: '#4a6cf7', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            padding: '5px 10px',
            flex: 1
          }}
        >
          Toggle Completion Status
        </button>
        
        <button 
          onClick={checkProfileStatus}
          style={{ 
            background: '#4a6cf7', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            padding: '5px 10px',
            flex: 1
          }}
        >
          Check API Status
        </button>
      </div>
      
      {debugMessage && (
        <div 
          style={{ 
            background: '#f8f8f8', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            padding: '5px',
            fontSize: '12px',
            maxHeight: '100px',
            overflowY: 'auto'
          }}
        >
          {debugMessage}
        </div>
      )}
    </div>
  );
};

export default ProfileDebugHelper;