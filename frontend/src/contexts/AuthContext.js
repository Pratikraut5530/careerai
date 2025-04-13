import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios defaults
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    
    // Add axios response interceptor to handle 401 errors
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        // If error is 401 and not a retried request
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh the token
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
              // No refresh token available, logout
              await handleLogout();
              return Promise.reject(error);
            }
            
            const refreshResponse = await axios.post(`${API_URL}/api/token/refresh/`, {
              refresh: refreshToken
            });
            
            // Update tokens
            localStorage.setItem("accessToken", refreshResponse.data.access);
            axios.defaults.headers.common["Authorization"] = `Bearer ${refreshResponse.data.access}`;
            
            // Retry the original request
            originalRequest.headers["Authorization"] = `Bearer ${refreshResponse.data.access}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout
            await handleLogout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    // Clean up interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Check if user is authenticated on load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await axios.get(`${API_URL}/api/auth/me/`);
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (err) {
        // Try refreshing the token
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            const refreshResponse = await axios.post(`${API_URL}/api/token/refresh/`, {
              refresh: refreshToken
            });
            
            // Save the new tokens
            localStorage.setItem("accessToken", refreshResponse.data.access);
            axios.defaults.headers.common["Authorization"] = `Bearer ${refreshResponse.data.access}`;
            
            // Try again with new token
            const userResponse = await axios.get(`${API_URL}/api/auth/me/`);
            setUser(userResponse.data);
            setIsAuthenticated(true);
          } else {
            // No refresh token, clear auth state
            handleLogout();
          }
        } catch (refreshErr) {
          // Refresh failed, clear auth state
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Register user
  const register = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/api/auth/register/`, formData);
      
      // Save tokens
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      
      // Set authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;
      
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data || "Registration failed";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/api/auth/login/`, {
        email,
        password
      });
      
      // Save tokens
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      
      // Set authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;
      
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data || "Login failed";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const handleLogout = async () => {
    try {
      setLoading(true);
      
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        // Blacklist the refresh token
        try {
          await axios.post(`${API_URL}/api/auth/logout/`, {
            refresh: refreshToken
          });
        } catch (err) {
          console.error("Error during logout:", err);
          // Continue with local logout even if API call fails
        }
      }
    } finally {
      // Clear local storage and state regardless of API response
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("profile_completed");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      // For profile completion status only
      if (profileData.is_profile_completed !== undefined) {
        const response = await axios.patch(`${API_URL}/api/auth/me/`, {
          is_profile_completed: profileData.is_profile_completed
        });
        
        // Update localStorage flag for UI state
        localStorage.setItem('profile_completed', 'true');
        
        // Update user state with updated data
        setUser(prev => ({
          ...prev,
          is_profile_completed: profileData.is_profile_completed
        }));
        
        return response.data;
      }
      
      // For full profile update
      const response = await axios.put(`${API_URL}/api/auth/profile/`, profileData);
      
      // Get updated user data
      const userResponse = await axios.get(`${API_URL}/api/auth/me/`);
      setUser(userResponse.data);
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data || "Profile update failed";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a value object with all auth-related data and functions
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout: handleLogout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};