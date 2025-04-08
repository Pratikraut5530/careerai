import axios from 'axios';
import { API_URL } from '../config';

// Get all alumni profiles
export const getAlumni = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/api/alumni/alumni/`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching alumni:', error);
    // Return mock data for development
    return [
      {
        id: 1,
        user: {
          id: 1,
          first_name: 'John',
          last_name: 'Smith',
          profile_image: 'https://via.placeholder.com/150'
        },
        graduation_year: 2020,
        current_company: {
          id: 1,
          name: 'Google'
        },
        position: 'Software Engineer',
        is_mentor: true,
        is_available_for_referrals: true,
        skills: [
          { id: 1, name: 'React' },
          { id: 2, name: 'JavaScript' },
          { id: 3, name: 'Python' }
        ],
        linkedin_profile: 'https://linkedin.com/in/johnsmith',
        github_profile: 'https://github.com/johnsmith'
      },
      {
        id: 2,
        user: {
          id: 2,
          first_name: 'Sarah',
          last_name: 'Johnson',
          profile_image: 'https://via.placeholder.com/150'
        },
        graduation_year: 2019,
        current_company: {
          id: 2,
          name: 'Microsoft'
        },
        position: 'Product Manager',
        is_mentor: true,
        is_available_for_referrals: false,
        skills: [
          { id: 4, name: 'Product Management' },
          { id: 5, name: 'Agile' },
          { id: 6, name: 'User Research' }
        ],
        linkedin_profile: 'https://linkedin.com/in/sarahjohnson'
      },
      {
        id: 3,
        user: {
          id: 3,
          first_name: 'Michael',
          last_name: 'Lee',
          profile_image: 'https://via.placeholder.com/150'
        },
        graduation_year: 2021,
        current_company: {
          id: 3,
          name: 'Amazon'
        },
        position: 'Data Scientist',
        is_mentor: false,
        is_available_for_referrals: true,
        skills: [
          { id: 7, name: 'Machine Learning' },
          { id: 8, name: 'Python' },
          { id: 9, name: 'SQL' }
        ],
        linkedin_profile: 'https://linkedin.com/in/michaellee'
      }
    ];
  }
};

// Get current user's alumni profile
export const getCurrentAlumniProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/alumni/alumni/me/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching current alumni profile:', error);
    return null;
  }
};

// Create alumni profile
export const createAlumniProfile = async (profileData) => {
  try {
    const response = await axios.post(`${API_URL}/api/alumni/alumni/`, profileData);
    return response.data;
  } catch (error) {
    console.error('Error creating alumni profile:', error);
    throw error;
  }
};

// Get available mentors
export const getMentors = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/api/alumni/mentor-profiles/`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching mentors:', error);
    // Return mock data for development
    return [
      {
        id: 1,
        alumni: {
          id: 1,
          user: {
            id: 1,
            first_name: 'John',
            last_name: 'Smith',
            profile_image: 'https://via.placeholder.com/150'
          },
          graduation_year: 2020,
          current_company: {
            id: 1,
            name: 'Google'
          },
          position: 'Software Engineer'
        },
        expertise_areas: [
          { id: 1, name: 'Web Development' },
          { id: 2, name: 'Career Advancement' }
        ],
        experience_years: 5,
        mentorship_style: 'Collaborative and goal-oriented. I prefer regular check-ins and practical projects.',
        is_available: true,
        current_mentee_count: 1,
        max_mentees: 3
      },
      {
        id: 2,
        alumni: {
          id: 2,
          user: {
            id: 2,
            first_name: 'Sarah',
            last_name: 'Johnson',
            profile_image: 'https://via.placeholder.com/150'
          },
          graduation_year: 2019,
          current_company: {
            id: 2,
            name: 'Microsoft'
          },
          position: 'Product Manager'
        },
        expertise_areas: [
          { id: 3, name: 'Product Management' },
          { id: 4, name: 'Interview Preparation' }
        ],
        experience_years: 6,
        mentorship_style: 'I focus on product thinking and career strategy. I provide actionable feedback and industry insights.',
        is_available: true,
        current_mentee_count: 2,
        max_mentees: 3
      }
    ];
  }
};

// Request mentorship
export const requestMentorship = async (mentorshipData) => {
  try {
    const response = await axios.post(`${API_URL}/api/alumni/mentorship-requests/`, mentorshipData);
    return response.data;
  } catch (error) {
    console.error('Error requesting mentorship:', error);
    throw error;
  }
};

// Get mentorship requests
export const getMentorshipRequests = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/alumni/mentorship-requests/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mentorship requests:', error);
    return [];
  }
};

// Accept mentorship request
export const acceptMentorshipRequest = async (requestId, goalData) => {
  try {
    const response = await axios.post(`${API_URL}/api/alumni/mentorship-requests/${requestId}/accept/`, goalData);
    return response.data;
  } catch (error) {
    console.error(`Error accepting mentorship request ${requestId}:`, error);
    throw error;
  }
};

// Reject mentorship request
export const rejectMentorshipRequest = async (requestId) => {
  try {
    const response = await axios.post(`${API_URL}/api/alumni/mentorship-requests/${requestId}/reject/`);
    return response.data;
  } catch (error) {
    console.error(`Error rejecting mentorship request ${requestId}:`, error);
    throw error;
  }
};

// Get mentorship relationships
export const getMentorshipRelationships = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/alumni/mentorship-relationships/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mentorship relationships:', error);
    return [];
  }
};

// Get alumni events
export const getAlumniEvents = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/api/alumni/events/`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching alumni events:', error);
    // Return mock data for development
    return [
      {
        id: 1,
        title: 'Tech Career Panel',
        description: 'Join our alumni panel to learn about careers in tech.',
        event_type: 'panel',
        start_datetime: '2025-04-15T18:00:00Z',
        end_datetime: '2025-04-15T20:00:00Z',
        location: { id: 1, name: 'Online' },
        is_virtual: true,
        virtual_meeting_url: 'https://zoom.us/j/1234567890',
        organizer: {
          id: 1,
          first_name: 'Admin',
          last_name: 'User'
        },
        is_past: false,
        is_ongoing: false,
        is_registered: false,
        registration_count: 15
      },
      {
        id: 2,
        title: 'Resume Workshop',
        description: 'Get feedback on your resume from alumni and recruiters.',
        event_type: 'workshop',
        start_datetime: '2025-04-20T15:00:00Z',
        end_datetime: '2025-04-20T17:00:00Z',
        location: { id: 2, name: 'Campus Center' },
        is_virtual: false,
        organizer: {
          id: 1,
          first_name: 'Admin',
          last_name: 'User'
        },
        is_past: false,
        is_ongoing: false,
        is_registered: false,
        registration_count: 20
      }
    ];
  }
};

// Register for event
export const registerForEvent = async (eventId) => {
  try {
    const response = await axios.post(`${API_URL}/api/alumni/events/${eventId}/register/`);
    return response.data;
  } catch (error) {
    console.error(`Error registering for event ${eventId}:`, error);
    throw error;
  }
};

// Unregister from event
export const unregisterFromEvent = async (eventId) => {
  try {
    const response = await axios.post(`${API_URL}/api/alumni/events/${eventId}/unregister/`);
    return response.data;
  } catch (error) {
    console.error(`Error unregistering from event ${eventId}:`, error);
    throw error;
  }
};

// Request a referral
export const requestReferral = async (referralData) => {
  try {
    const response = await axios.post(`${API_URL}/api/alumni/referrals/`, referralData);
    return response.data;
  } catch (error) {
    console.error('Error requesting referral:', error);
    throw error;
  }
};

// Get referral requests
export const getReferralRequests = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/alumni/referrals/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching referral requests:', error);
    return [];
  }
};

// Accept referral request
export const acceptReferralRequest = async (referralId) => {
  try {
    const response = await axios.post(`${API_URL}/api/alumni/referrals/${referralId}/accept/`);
    return response.data;
  } catch (error) {
    console.error(`Error accepting referral request ${referralId}:`, error);
    throw error;
  }
};

// Reject referral request
export const rejectReferralRequest = async (referralId) => {
  try {
    const response = await axios.post(`${API_URL}/api/alumni/referrals/${referralId}/reject/`);
    return response.data;
  } catch (error) {
    console.error(`Error rejecting referral request ${referralId}:`, error);
    throw error;
  }
};

// Complete referral request
export const completeReferralRequest = async (referralId) => {
  try {
    const response = await axios.post(`${API_URL}/api/alumni/referrals/${referralId}/complete/`);
    return response.data;
  } catch (error) {
    console.error(`Error completing referral request ${referralId}:`, error);
    throw error;
  }
};

// Add a session to a mentorship relationship
export const addMentorshipSession = async (relationshipId, sessionData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/alumni/mentorship-relationships/${relationshipId}/sessions/`,
      sessionData
    );
    return response.data;
  } catch (error) {
    console.error(`Error adding session to relationship ${relationshipId}:`, error);
    throw error;
  }
};

// Get sessions for a mentorship relationship
export const getMentorshipSessions = async (relationshipId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/alumni/mentorship-relationships/${relationshipId}/sessions/`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching sessions for relationship ${relationshipId}:`, error);
    return [];
  }
};

// Create an alumni event
export const createAlumniEvent = async (eventData) => {
  try {
    const response = await axios.post(`${API_URL}/api/alumni/events/`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating alumni event:', error);
    throw error;
  }
};

// Get event registrations
export const getEventRegistrations = async (eventId) => {
  try {
    const response = await axios.get(`${API_URL}/api/alumni/events/${eventId}/registrations/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching registrations for event ${eventId}:`, error);
    return [];
  }
};

// Mark attendance for an event registration
export const markEventAttendance = async (eventId, registrationId) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/alumni/events/${eventId}/registrations/${registrationId}/mark_attended/`
    );
    return response.data;
  } catch (error) {
    console.error(`Error marking attendance for registration ${registrationId}:`, error);
    throw error;
  }
};

// Provide feedback for an event
export const provideEventFeedback = async (eventId, registrationId, feedback) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/alumni/events/${eventId}/registrations/${registrationId}/add_feedback/`,
      { feedback }
    );
    return response.data;
  } catch (error) {
    console.error(`Error providing feedback for event ${eventId}:`, error);
    throw error;
  }
};