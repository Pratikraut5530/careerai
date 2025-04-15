// import axios from 'axios';
// import { API_URL } from '../config';
import { getImageUrl } from '../utils/imageUtils';

// Mock alumni data
const mockAlumni = [
  {
    id: 1,
    user: {
      id: 1,
      first_name: 'John',
      last_name: 'Smith',
      profile_image: getImageUrl('avatar', 'profile1')
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
      profile_image: getImageUrl('avatar', 'profile3')
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
      profile_image: getImageUrl('avatar', 'profile2')
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

// Mock mentors data
const mockMentors = [
  {
    id: 1,
    alumni: {
      id: 1,
      user: {
        id: 1,
        first_name: 'John',
        last_name: 'Smith',
        profile_image: getImageUrl('avatar', 'profile1')
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
        profile_image: getImageUrl('avatar', 'profile3')
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

// Update mockEvents and other mock objects with organizer images
const mockEvents = [
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
      last_name: 'User',
      profile_image: getImageUrl('avatar', 'profile4')
    },
    is_past: false,
    is_ongoing: false,
    is_registered: false,
    registration_count: 15
  },
  // ... Update the other events similarly
];

// Mock mentorship requests
const mockMentorshipRequests = [
  {
    id: 1,
    user: {
      id: 4,
      first_name: 'Emma',
      last_name: 'Wilson',
      profile_image: 'https://via.placeholder.com/150'
    },
    mentor_id: 1,
    message: 'I\'m interested in learning more about web development and would love your guidance on transitioning into this field.',
    areas_of_interest: [
      { id: 1, name: 'Web Development' }
    ],
    status: 'pending',
    requested_at: '2025-04-01T10:30:00Z'
  }
];

// Mock mentorship relationships
const mockMentorshipRelationships = [
  {
    id: 1,
    mentor: {
      id: 2,
      alumni: {
        id: 2,
        user: {
          id: 2,
          first_name: 'Sarah',
          last_name: 'Johnson',
          profile_image: 'https://via.placeholder.com/150'
        },
        position: 'Product Manager',
        current_company: {
          name: 'Microsoft'
        }
      }
    },
    mentee: {
      id: 5,
      first_name: 'David',
      last_name: 'Chen',
      profile_image: 'https://via.placeholder.com/150'
    },
    status: 'active',
    goals: 'Work on product management skills and prepare for interviews',
    started_at: '2025-03-15T14:00:00Z',
    ended_at: null
  }
];

// Mock mentorship sessions
const mockMentorshipSessions = [
  {
    id: 1,
    relationship_id: 1,
    title: 'Initial Planning Session',
    date: '2025-03-20T15:00:00Z',
    duration_minutes: 60,
    topics_discussed: 'Discussed mentee\'s background and career goals. Identified key areas to focus on during our mentorship.',
    action_items: '- Mentee to read recommended product management books\n- Mentor to share interview question resources\n- Schedule next session in two weeks',
    notes: 'Great first session. David shows a strong interest in product management fundamentals.'
  }
];

// Get all alumni profiles
export const getAlumni = async (params = {}) => {
  return mockAlumni;
};

// Get current user's alumni profile
export const getCurrentAlumniProfile = async () => {
  return mockAlumni[0]; // Return first alumni as current user
};

// Create alumni profile
export const createAlumniProfile = async (profileData) => {
  return {
    id: Math.floor(Math.random() * 1000) + 100,
    ...profileData,
    created_at: new Date().toISOString()
  };
};

// Get available mentors
export const getMentors = async (params = {}) => {
  return mockMentors;
};

// Request mentorship
export const requestMentorship = async (mentorshipData) => {
  return {
    id: Math.floor(Math.random() * 1000) + 100,
    ...mentorshipData,
    status: 'pending',
    requested_at: new Date().toISOString()
  };
};

// Get mentorship requests
export const getMentorshipRequests = async () => {
  return mockMentorshipRequests;
};

// Accept mentorship request
export const acceptMentorshipRequest = async (requestId, goalData) => {
  // Update request status
  const requestIndex = mockMentorshipRequests.findIndex(r => r.id === requestId);
  if (requestIndex !== -1) {
    mockMentorshipRequests[requestIndex].status = 'accepted';
  }
  
  // Create new relationship
  const newRelationship = {
    id: Math.floor(Math.random() * 1000) + 100,
    mentor: mockMentors.find(m => m.id === mockMentorshipRequests[requestIndex].mentor_id),
    mentee: mockMentorshipRequests[requestIndex].user,
    status: 'active',
    goals: goalData.goals,
    started_at: new Date().toISOString(),
    ended_at: null
  };
  
  mockMentorshipRelationships.push(newRelationship);
  
  return newRelationship;
};

// Reject mentorship request
export const rejectMentorshipRequest = async (requestId) => {
  // Update request status
  const requestIndex = mockMentorshipRequests.findIndex(r => r.id === requestId);
  if (requestIndex !== -1) {
    mockMentorshipRequests[requestIndex].status = 'rejected';
  }
  
  return { success: true, message: 'Mentorship request rejected successfully' };
};

// Get mentorship relationships
export const getMentorshipRelationships = async () => {
  return mockMentorshipRelationships;
};

// Get alumni events
export const getAlumniEvents = async (params = {}) => {
  return mockEvents;
};

// Register for event
export const registerForEvent = async (eventId) => {
  // Update event registration status
  const eventIndex = mockEvents.findIndex(e => e.id === parseInt(eventId));
  if (eventIndex !== -1) {
    mockEvents[eventIndex].is_registered = true;
    mockEvents[eventIndex].registration_count += 1;
  }
  
  return { success: true, message: 'Successfully registered for event' };
};

// Unregister from event
export const unregisterFromEvent = async (eventId) => {
  // Update event registration status
  const eventIndex = mockEvents.findIndex(e => e.id === parseInt(eventId));
  if (eventIndex !== -1) {
    mockEvents[eventIndex].is_registered = false;
    mockEvents[eventIndex].registration_count -= 1;
  }
  
  return { success: true, message: 'Successfully unregistered from event' };
};

// Request a referral
export const requestReferral = async (referralData) => {
  return {
    id: Math.floor(Math.random() * 1000) + 100,
    ...referralData,
    status: 'pending',
    requested_at: new Date().toISOString()
  };
};

// Get referral requests
export const getReferralRequests = async () => {
  return [
    {
      id: 1,
      user: {
        id: 5,
        first_name: 'Maria',
        last_name: 'Garcia',
        profile_image: 'https://via.placeholder.com/150'
      },
      alumni_id: 1,
      company_name: 'Google',
      position_title: 'Software Engineer',
      message: 'I am really interested in working at Google and would appreciate a referral for this position.',
      status: 'pending',
      requested_at: '2025-03-28T11:15:00Z'
    }
  ];
};

// Accept referral request
export const acceptReferralRequest = async (referralId) => {
  return { success: true, message: 'Referral request accepted successfully' };
};

// Reject referral request
export const rejectReferralRequest = async (referralId) => {
  return { success: true, message: 'Referral request rejected successfully' };
};

// Complete referral request
export const completeReferralRequest = async (referralId) => {
  return { success: true, message: 'Referral request completed successfully' };
};

// Add a session to a mentorship relationship
export const addMentorshipSession = async (relationshipId, sessionData) => {
  const newSession = {
    id: Math.floor(Math.random() * 1000) + 100,
    relationship_id: parseInt(relationshipId),
    ...sessionData,
    created_at: new Date().toISOString()
  };
  
  mockMentorshipSessions.push(newSession);
  
  return newSession;
};

// Get sessions for a mentorship relationship
export const getMentorshipSessions = async (relationshipId) => {
  return mockMentorshipSessions.filter(s => s.relationship_id === parseInt(relationshipId));
};

// Create an alumni event
export const createAlumniEvent = async (eventData) => {
  const newEvent = {
    id: Math.floor(Math.random() * 1000) + 100,
    ...eventData,
    registration_count: 0,
    is_registered: false,
    created_at: new Date().toISOString()
  };
  
  mockEvents.push(newEvent);
  
  return newEvent;
};

// Get event registrations
export const getEventRegistrations = async (eventId) => {
  return [
    {
      id: 1,
      event_id: parseInt(eventId),
      user: {
        id: 5,
        first_name: 'David',
        last_name: 'Chen',
        profile_image: 'https://via.placeholder.com/150'
      },
      registered_at: '2025-04-01T14:30:00Z',
      attended: false
    },
    {
      id: 2,
      event_id: parseInt(eventId),
      user: {
        id: 6,
        first_name: 'Rachel',
        last_name: 'Kim',
        profile_image: 'https://via.placeholder.com/150'
      },
      registered_at: '2025-04-02T09:15:00Z',
      attended: false
    }
  ];
};

// Mark attendance for an event registration
export const markEventAttendance = async (eventId, registrationId) => {
  return { success: true, message: 'Attendance marked successfully' };
};

// Provide feedback for an event
export const provideEventFeedback = async (eventId, registrationId, feedback) => {
  return { 
    id: Math.floor(Math.random() * 1000) + 100,
    event_id: parseInt(eventId),
    registration_id: parseInt(registrationId),
    feedback: feedback,
    created_at: new Date().toISOString()
  };
};