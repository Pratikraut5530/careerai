import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getMentorshipRequests, 
  acceptMentorshipRequest, 
  rejectMentorshipRequest,
  getMentorshipRelationships,
  getMentorshipSessions,
  addMentorshipSession
} from '../../services/alumniService';
import { useAuth } from '../../contexts/AuthContext';
import './MentorshipDashboard.css';

const MentorshipDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('relationships');
  const [relationships, setRelationships] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states for new session
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [currentRelationship, setCurrentRelationship] = useState(null);
  const [sessionData, setSessionData] = useState({
    title: '',
    date: '',
    duration_minutes: 30,
    topics_discussed: '',
    action_items: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    fetchMentorshipData();
  }, []);
  
  const fetchMentorshipData = async () => {
    try {
      setLoading(true);
      
      // Fetch relationships and requests in parallel
      const [relationshipsData, requestsData] = await Promise.all([
        getMentorshipRelationships(),
        getMentorshipRequests()
      ]);
      
      setRelationships(relationshipsData);
      setRequests(requestsData);
      
      // Fetch sessions for each relationship
      const sessionsObj = {};
      for (const relationship of relationshipsData) {
        try {
          const relationshipSessions = await getMentorshipSessions(relationship.id);
          sessionsObj[relationship.id] = relationshipSessions;
        } catch (err) {
          console.error(`Error fetching sessions for relationship ${relationship.id}:`, err);
          sessionsObj[relationship.id] = [];
        }
      }
      
      setSessions(sessionsObj);
    } catch (err) {
      console.error('Error fetching mentorship data:', err);
      setError('Failed to load mentorship data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAcceptRequest = async (requestId) => {
    try {
      // Goals could be specified but for simplicity we're hard-coding them here
      const goalData = { 
        goals: 'Work on professional development and career advancement.'
      };
      
      await acceptMentorshipRequest(requestId, goalData);
      
      // Update local state - remove from requests and add to relationships
      const acceptedRequest = requests.find(req => req.id === requestId);
      setRequests(requests.filter(req => req.id !== requestId));
      
      // Refresh the relationships after accepting
      fetchMentorshipData();
    } catch (err) {
      console.error(`Error accepting request ${requestId}:`, err);
      alert('Failed to accept mentorship request. Please try again.');
    }
  };
  
  const handleRejectRequest = async (requestId) => {
    try {
      await rejectMentorshipRequest(requestId);
      
      // Update local state
      setRequests(requests.filter(req => req.id !== requestId));
    } catch (err) {
      console.error(`Error rejecting request ${requestId}:`, err);
      alert('Failed to reject mentorship request. Please try again.');
    }
  };
  
  const handleAddSession = async (e) => {
    e.preventDefault();
    
    if (!currentRelationship) {
      alert('No relationship selected');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const result = await addMentorshipSession(currentRelationship.id, sessionData);
      
      // Update sessions state
      setSessions(prev => ({
        ...prev,
        [currentRelationship.id]: [...(prev[currentRelationship.id] || []), result]
      }));
      
      // Reset form
      setSessionData({
        title: '',
        date: '',
        duration_minutes: 30,
        topics_discussed: '',
        action_items: '',
        notes: ''
      });
      
      setShowSessionForm(false);
    } catch (err) {
      console.error('Error adding session:', err);
      alert('Failed to add mentorship session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const openNewSessionForm = (relationship) => {
    setCurrentRelationship(relationship);
    setShowSessionForm(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSessionData({
      ...sessionData,
      [name]: value
    });
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Determine if user is a mentor
  const isMentor = user && user.is_profile_completed;
  
  if (loading) {
    return <div className="loading">Loading mentorship dashboard...</div>;
  }
  
  return (
    <div className="mentorship-dashboard">
      <div className="page-header">
        <h1>Mentorship Dashboard</h1>
        <p>Manage your mentorship connections and sessions</p>
      </div>
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}
      
      <div className="mentorship-tabs">
        <button 
          className={`tab-button ${activeTab === 'relationships' ? 'active' : ''}`}
          onClick={() => setActiveTab('relationships')}
        >
          <i className="fas fa-users"></i> Mentorship Relationships
        </button>
        
        <button 
          className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <i className="fas fa-user-plus"></i> Mentorship Requests
          {requests.filter(req => req.status === 'pending').length > 0 && (
            <span className="badge">
              {requests.filter(req => req.status === 'pending').length}
            </span>
          )}
        </button>
        
        <button 
          className={`tab-button ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          <i className="fas fa-calendar-alt"></i> Mentorship Sessions
        </button>
      </div>
      
      <div className="tab-content">
        {/* Relationships Tab */}
        {activeTab === 'relationships' && (
          <div className="relationships-tab">
            {relationships.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-user-friends empty-icon"></i>
                <h3>No mentorship relationships yet</h3>
                <p>
                  {isMentor 
                    ? "You don't have any active mentorships yet. Check the Requests tab for pending mentorship requests." 
                    : "You don't have any mentorships yet. Connect with mentors to kickstart your career growth."
                  }
                </p>
                {!isMentor && (
                  <Link to="/mentors" className="btn-primary">Find a Mentor</Link>
                )}
              </div>
            ) : (
              <div className="relationships-container">
                {relationships.map(relationship => (
                  <div key={relationship.id} className="relationship-card">
                    <div className="relationship-header">
                      <div className="participant-info">
                        <div className="participant-avatar">
                          <img 
                            src={
                              (isMentor && relationship.mentee.profile_image) || 
                              (!isMentor && relationship.mentor.alumni.user.profile_image) || 
                              'https://via.placeholder.com/60'
                            } 
                            alt={
                              isMentor 
                                ? `${relationship.mentee.first_name} ${relationship.mentee.last_name}` 
                                : `${relationship.mentor.alumni.user.first_name} ${relationship.mentor.alumni.user.last_name}`
                            } 
                          />
                        </div>
                        <div className="participant-details">
                          <h3 className="participant-name">
                            {isMentor 
                              ? `${relationship.mentee.first_name} ${relationship.mentee.last_name}` 
                              : `${relationship.mentor.alumni.user.first_name} ${relationship.mentor.alumni.user.last_name}`
                            }
                          </h3>
                          {isMentor ? (
                            <p className="participant-role">Mentee</p>
                          ) : (
                            <p className="participant-role">
                              Mentor · {relationship.mentor.alumni.position} at {relationship.mentor.alumni.current_company?.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="relationship-status">
                        <span className={`status-badge ${relationship.status}`}>
                          {relationship.status.charAt(0).toUpperCase() + relationship.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="relationship-info">
                      <div className="goals-section">
                        <h4>Mentorship Goals</h4>
                        <p>{relationship.goals}</p>
                      </div>
                      
                      <div className="relationship-meta">
                        <div className="meta-item">
                          <span className="meta-label">Started</span>
                          <span className="meta-value">{formatDate(relationship.started_at)}</span>
                        </div>
                        
                        {relationship.ended_at && (
                          <div className="meta-item">
                            <span className="meta-label">Ended</span>
                            <span className="meta-value">{formatDate(relationship.ended_at)}</span>
                          </div>
                        )}
                        
                        <div className="meta-item">
                          <span className="meta-label">Sessions</span>
                          <span className="meta-value">
                            {sessions[relationship.id]?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relationship-actions">
                      <button 
                        className="btn-new-session"
                        onClick={() => openNewSessionForm(relationship)}
                        disabled={relationship.status !== 'active'}
                      >
                        <i className="fas fa-plus-circle"></i> New Session
                      </button>
                      <button className="btn-message">
                        <i className="fas fa-comment"></i> Message
                      </button>
                      <button className="btn-view-details">
                        <i className="fas fa-eye"></i> View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="requests-tab">
            {requests.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox empty-icon"></i>
                <h3>No mentorship requests</h3>
                <p>
                  {isMentor 
                    ? "You don't have any pending mentorship requests at the moment." 
                    : "You haven't sent any mentorship requests yet."
                  }
                </p>
                {!isMentor && (
                  <Link to="/mentors" className="btn-primary">Find a Mentor</Link>
                )}
              </div>
            ) : (
              <div className="requests-container">
                <div className="requests-list">
                  {requests.map(request => (
                    <div key={request.id} className="request-card">
                      <div className="request-header">
                        <div className="requester-info">
                          <div className="requester-avatar">
                            <img 
                              src={request.user.profile_image || 'https://via.placeholder.com/60'} 
                              alt={`${request.user.first_name} ${request.user.last_name}`} 
                            />
                          </div>
                          <div className="requester-details">
                            <h3 className="requester-name">
                              {request.user.first_name} {request.user.last_name}
                            </h3>
                            <p className="request-date">
                              Requested on {formatDate(request.requested_at)}
                            </p>
                          </div>
                        </div>
                        <div className="request-status">
                          <span className={`status-badge ${request.status}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="request-message">
                        <h4>Message</h4>
                        <p>{request.message}</p>
                      </div>
                      
                      <div className="request-areas">
                        <h4>Areas of Interest</h4>
                        <div className="area-tags">
                          {request.areas_of_interest.map(area => (
                            <span key={area.id} className="area-tag">{area.name}</span>
                          ))}
                        </div>
                      </div>
                      
                      {request.status === 'pending' && isMentor && (
                        <div className="request-actions">
                          <button 
                            className="btn-accept"
                            onClick={() => handleAcceptRequest(request.id)}
                          >
                            Accept Request
                          </button>
                          <button 
                            className="btn-reject"
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="sessions-tab">
            {Object.values(sessions).flat().length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-calendar-alt empty-icon"></i>
                <h3>No mentorship sessions yet</h3>
                <p>Once you have mentorship sessions, they will appear here.</p>
              </div>
            ) : (
              <div className="sessions-list">
                {relationships.map(relationship => {
                  const relationshipSessions = sessions[relationship.id] || [];
                  if (relationshipSessions.length === 0) return null;
                  
                  return (
                    <div key={relationship.id} className="relationship-sessions">
                      <div className="relationship-sessions-header">
                        <h3>
                          Sessions with {isMentor 
                            ? `${relationship.mentee.first_name} ${relationship.mentee.last_name}` 
                            : `${relationship.mentor.alumni.user.first_name} ${relationship.mentor.alumni.user.last_name}`
                          }
                        </h3>
                        <button 
                          className="btn-new-session-small"
                          onClick={() => openNewSessionForm(relationship)}
                          disabled={relationship.status !== 'active'}
                        >
                          <i className="fas fa-plus"></i> New Session
                        </button>
                      </div>
                      
                      <div className="sessions-timeline">
                        {relationshipSessions.map((session, index) => (
                          <div key={session.id} className="session-card">
                            <div className="session-timeline-connector">
                              <div className="timeline-dot"></div>
                              {index < relationshipSessions.length - 1 && <div className="timeline-line"></div>}
                            </div>
                            
                            <div className="session-content">
                              <div className="session-header">
                                <h4>{session.title}</h4>
                                <div className="session-meta">
                                  <span className="session-date">
                                    <i className="far fa-calendar"></i> {formatDate(session.date)}
                                  </span>
                                  <span className="session-time">
                                    <i className="far fa-clock"></i> {formatTime(session.date)}
                                  </span>
                                  <span className="session-duration">
                                    <i className="fas fa-hourglass-half"></i> {session.duration_minutes} minutes
                                  </span>
                                </div>
                              </div>
                              
                              <div className="session-topics">
                                <h5>Topics Discussed</h5>
                                <p>{session.topics_discussed}</p>
                              </div>
                              
                              {session.action_items && (
                                <div className="session-action-items">
                                  <h5>Action Items</h5>
                                  <p>{session.action_items}</p>
                                </div>
                              )}
                              
                              {session.notes && (
                                <div className="session-notes">
                                  <h5>Notes</h5>
                                  <p>{session.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* New Session Form Modal */}
      {showSessionForm && currentRelationship && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Log New Mentorship Session</h2>
              <button 
                className="close-button"
                onClick={() => setShowSessionForm(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleAddSession} className="session-form">
              <div className="form-group">
                <label htmlFor="title">Session Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={sessionData.title}
                  onChange={handleInputChange}
                  placeholder="E.g., Career Planning Discussion"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Session Date & Time</label>
                  <input
                    type="datetime-local"
                    id="date"
                    name="date"
                    value={sessionData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="duration_minutes">Duration (minutes)</label>
                  <input
                    type="number"
                    id="duration_minutes"
                    name="duration_minutes"
                    value={sessionData.duration_minutes}
                    onChange={handleInputChange}
                    min="5"
                    max="180"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="topics_discussed">Topics Discussed</label>
                <textarea
                  id="topics_discussed"
                  name="topics_discussed"
                  value={sessionData.topics_discussed}
                  onChange={handleInputChange}
                  placeholder="Summary of what was discussed during the session"
                  rows="3"
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="action_items">Action Items (Optional)</label>
                <textarea
                  id="action_items"
                  name="action_items"
                  value={sessionData.action_items}
                  onChange={handleInputChange}
                  placeholder="Next steps and tasks to complete"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Additional Notes (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={sessionData.notes}
                  onChange={handleInputChange}
                  placeholder="Any other notes or observations"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowSessionForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-save"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipDashboard;