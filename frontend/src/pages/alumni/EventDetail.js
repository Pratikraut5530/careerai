import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getAlumniEvents, registerForEvent, unregisterFromEvent } from '../../services/alumniService';
import { getImageUrl } from '../../utils/imageUtils';
import './Alumni.css';

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const eventsData = await getAlumniEvents();
        
        // Find the specific event
        const foundEvent = eventsData.find(event => event.id === parseInt(eventId));
        
        if (!foundEvent) {
          setError('Event not found');
        } else {
          setEvent(foundEvent);
        }
      } catch (err) {
        console.error(`Error fetching event ${eventId}:`, err);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [eventId]);
  
  const handleRegister = async () => {
    try {
      setRegistering(true);
      await registerForEvent(eventId);
      
      // Update local state
      setEvent({
        ...event,
        is_registered: true,
        registration_count: event.registration_count + 1
      });
    } catch (err) {
      console.error(`Error registering for event ${eventId}:`, err);
      alert('Failed to register for this event. Please try again.');
    } finally {
      setRegistering(false);
    }
  };
  
  const handleUnregister = async () => {
    try {
      setRegistering(true);
      await unregisterFromEvent(eventId);
      
      // Update local state
      setEvent({
        ...event,
        is_registered: false,
        registration_count: event.registration_count - 1
      });
    } catch (err) {
      console.error(`Error unregistering from event ${eventId}:`, err);
      alert('Failed to cancel your registration. Please try again.');
    } finally {
      setRegistering(false);
    }
  };
  
  // Format date and time
  const formatDate = (dateString) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };
  
  // Determine event status
  const getEventStatus = (event) => {
    const now = new Date();
    const eventStart = new Date(event.start_datetime);
    const eventEnd = new Date(event.end_datetime);
    
    if (now < eventStart) {
      return { text: 'Upcoming', class: 'status-upcoming' };
    } else if (now >= eventStart && now <= eventEnd) {
      return { text: 'Ongoing', class: 'status-ongoing' };
    } else {
      return { text: 'Past', class: 'status-past' };
    }
  };
  
  // Check if an event is in the future
  const isUpcomingEvent = (event) => {
    return new Date(event.start_datetime) > new Date();
  };
  
  // Format duration
  const getDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const durationMs = endTime - startTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minute${minutes !== 1 ? 's' : ''}` : ''}`;
    } else {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  };
  
  if (loading) {
    return <div className="loading">Loading event details...</div>;
  }
  
  if (error || !event) {
    return (
      <div className="event-detail-page">
        <div className="not-found-message">
          <h2>Event Not Found</h2>
          <p>{error || 'The event you are looking for does not exist or has been removed.'}</p>
          <Link to="/alumni-events" className="btn-primary">Back to Events</Link>
        </div>
      </div>
    );
  }
  
  const status = getEventStatus(event);
  
  return (
    <div className="event-detail-page">
      <div className="event-navigation">
        <Link to="/alumni-events" className="back-link">
          <i className="fas fa-arrow-left"></i> Back to Events
        </Link>
      </div>
      
      <div className="event-detail-container">
        <div className="event-header">
          <div className="event-header-content">
            <div className="event-meta">
              <span className={`event-type-badge ${event.event_type}`}>
                {event.event_type.replace('_', ' ').charAt(0).toUpperCase() + event.event_type.replace('_', ' ').slice(1)}
              </span>
              <span className={`event-status-badge ${status.class}`}>
                {status.text}
              </span>
            </div>
            
            <h1 className="event-title">{event.title}</h1>
            
            <div className="organizer-info">
              Organized by: <span className="organizer-name">{event.organizer.first_name} {event.organizer.last_name}</span>
            </div>
          </div>
          
          <div className="event-stats">
            <div className="stat-item">
              <div className="stat-value">{event.registration_count}</div>
              <div className="stat-label">Registered</div>
            </div>
            
            {isUpcomingEvent(event) && (
              <div className="registration-action">
                {event.is_registered ? (
                  <button 
                    className="btn-unregister" 
                    onClick={handleUnregister}
                    disabled={registering}
                  >
                    {registering ? 'Cancelling...' : 'Cancel Registration'}
                  </button>
                ) : (
                  <button 
                    className="btn-register" 
                    onClick={handleRegister}
                    disabled={registering}
                  >
                    {registering ? 'Registering...' : 'Register Now'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="event-content">
          <div className="event-main">
            <div className="event-date-time">
              <div className="event-calendar">
                <div className="calendar-month">
                  {new Date(event.start_datetime).toLocaleString('default', { month: 'short' })}
                </div>
                <div className="calendar-day">
                  {new Date(event.start_datetime).getDate()}
                </div>
              </div>
              
              <div className="event-time-location">
                <div className="event-detail">
                  <i className="far fa-calendar-alt"></i>
                  <span>{formatDate(event.start_datetime)}</span>
                </div>
                
                <div className="event-detail">
                  <i className="far fa-clock"></i>
                  <span>
                    {formatTime(event.start_datetime)} - {formatTime(event.end_datetime)}
                    <span className="event-duration">
                      ({getDuration(event.start_datetime, event.end_datetime)})
                    </span>
                  </span>
                </div>
                
                <div className="event-detail">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>
                    {event.is_virtual 
                      ? 'Online Event' 
                      : event.location?.name || 'Location TBD'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="event-description-section">
              <h2>About This Event</h2>
              <div className="event-description">
                <p>{event.description}</p>
              </div>
            </div>
            
            {event.is_virtual && event.is_registered && (
              <div className="virtual-meeting-section">
                <h2>Virtual Meeting Information</h2>
                <div className="meeting-info">
                  <p>This is an online event. Click the button below to join the meeting:</p>
                  <a 
                    href={event.virtual_meeting_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-join-meeting"
                  >
                    <i className="fas fa-video"></i> Join Meeting
                  </a>
                  <p className="meeting-note">
                    <i className="fas fa-info-circle"></i> 
                    The meeting link will be active 15 minutes before the event starts.
                  </p>
                </div>
              </div>
            )}
            
            <div className="what-to-expect-section">
              <h2>What to Expect</h2>
              <div className="expectation-items">
                {event.event_type === 'panel' && (
                  <>
                    <div className="expectation-item">
                      <i className="fas fa-users"></i>
                      <div className="expectation-content">
                        <h3>Expert Panel Discussion</h3>
                        <p>Hear from industry professionals sharing their experiences and insights.</p>
                      </div>
                    </div>
                    <div className="expectation-item">
                      <i className="fas fa-question-circle"></i>
                      <div className="expectation-content">
                        <h3>Q&A Session</h3>
                        <p>Get your questions answered by our panelists in a dedicated Q&A session.</p>
                      </div>
                    </div>
                  </>
                )}
                
                {event.event_type === 'workshop' && (
                  <>
                    <div className="expectation-item">
                      <i className="fas fa-chalkboard-teacher"></i>
                      <div className="expectation-content">
                        <h3>Hands-on Learning</h3>
                        <p>Participate in interactive exercises and practical activities.</p>
                      </div>
                    </div>
                    <div className="expectation-item">
                      <i className="fas fa-laptop-code"></i>
                      <div className="expectation-content">
                        <h3>Skill Development</h3>
                        <p>Learn new skills and techniques that you can apply immediately.</p>
                      </div>
                    </div>
                  </>
                )}
                
                {event.event_type === 'networking' && (
                  <>
                    <div className="expectation-item">
                      <i className="fas fa-handshake"></i>
                      <div className="expectation-content">
                        <h3>Networking Opportunities</h3>
                        <p>Connect with alumni and professionals from various industries.</p>
                      </div>
                    </div>
                    <div className="expectation-item">
                      <i className="fas fa-comments"></i>
                      <div className="expectation-content">
                        <h3>Casual Conversations</h3>
                        <p>Engage in informal discussions about career paths and opportunities.</p>
                      </div>
                    </div>
                  </>
                )}
                
                {event.event_type === 'career_fair' && (
                  <>
                    <div className="expectation-item">
                      <i className="fas fa-building"></i>
                      <div className="expectation-content">
                        <h3>Company Booths</h3>
                        <p>Explore booths from various companies looking to hire talent.</p>
                      </div>
                    </div>
                    <div className="expectation-item">
                      <i className="fas fa-briefcase"></i>
                      <div className="expectation-content">
                        <h3>Job Opportunities</h3>
                        <p>Discover internship and full-time job openings across different sectors.</p>
                      </div>
                    </div>
                  </>
                )}
                
                {event.event_type === 'webinar' && (
                  <>
                    <div className="expectation-item">
                      <i className="fas fa-desktop"></i>
                      <div className="expectation-content">
                        <h3>Live Presentation</h3>
                        <p>Watch an informative presentation on the topic with visual materials.</p>
                      </div>
                    </div>
                    <div className="expectation-item">
                      <i className="fas fa-certificate"></i>
                      <div className="expectation-content">
                        <h3>Professional Insights</h3>
                        <p>Gain knowledge from industry experts and thought leaders.</p>
                      </div>
                    </div>
                  </>
                )}
                
                {event.event_type === 'social' && (
                  <>
                    <div className="expectation-item">
                      <i className="fas fa-glass-cheers"></i>
                      <div className="expectation-content">
                        <h3>Casual Gathering</h3>
                        <p>Enjoy a relaxed atmosphere to meet and connect with fellow alumni.</p>
                      </div>
                    </div>
                    <div className="expectation-item">
                      <i className="fas fa-user-friends"></i>
                      <div className="expectation-content">
                        <h3>Community Building</h3>
                        <p>Strengthen your alumni network through informal interactions.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="event-sidebar">
            <div className="registration-card">
              <h3>Registration Details</h3>
              <div className="registration-info">
                <div className="info-item">
                  <i className="fas fa-users"></i>
                  <span>{event.registration_count} people registered</span>
                </div>
                
                {isUpcomingEvent(event) ? (
                  <div className="registration-status">
                    {event.is_registered ? (
                      <>
                        <div className="registered-badge">
                          <i className="fas fa-check-circle"></i> You're Registered
                        </div>
                        <button 
                          className="btn-unregister-sidebar" 
                          onClick={handleUnregister}
                          disabled={registering}
                        >
                          {registering ? 'Cancelling...' : 'Cancel Registration'}
                        </button>
                      </>
                    ) : (
                      <button 
                        className="btn-register-sidebar" 
                        onClick={handleRegister}
                        disabled={registering}
                      >
                        {registering ? 'Registering...' : 'Register Now'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="event-passed-message">
                    <i className="fas fa-calendar-times"></i>
                    <span>Event has {new Date() > new Date(event.end_datetime) ? 'ended' : 'already started'}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="organizer-card">
              <h3>Organizer</h3>
              <div className="organizer-profile">
                <div className="organizer-avatar">
                  <img 
                    src={event.organizer.profile_image || getImageUrl('avatar')} 
                    alt={`${event.organizer.first_name} ${event.organizer.last_name}`} 
                  />
                </div>
                <div className="organizer-info">
                  <h4>{event.organizer.first_name} {event.organizer.last_name}</h4>
                  <p className="organizer-title">Event Coordinator</p>
                </div>
              </div>
            </div>
            
            <div className="share-card">
              <h3>Share This Event</h3>
              <div className="share-buttons">
                <button className="share-btn facebook">
                  <i className="fab fa-facebook-f"></i>
                </button>
                <button className="share-btn twitter">
                  <i className="fab fa-twitter"></i>
                </button>
                <button className="share-btn linkedin">
                  <i className="fab fa-linkedin-in"></i>
                </button>
                <button className="share-btn email">
                  <i className="fas fa-envelope"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .event-detail-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        
        .event-navigation {
          margin-bottom: 2rem;
        }
        
        .back-link {
          display: inline-flex;
          align-items: center;
          color: var(--gray-600);
          font-size: 0.875rem;
          text-decoration: none;
        }
        
        .back-link i {
          margin-right: 0.5rem;
        }
        
        .back-link:hover {
          color: var(--primary);
        }
        
        .event-detail-container {
          background-color: var(--white);
          border-radius: 0.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        
        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          background-color: var(--gray-50);
          border-bottom: 1px solid var(--gray-200);
        }
        
        @media (max-width: 768px) {
          .event-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
        }
        
        .event-header-content {
          flex: 1;
        }
        
        .event-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .event-type-badge,
        .event-status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .event-type-badge {
          background-color: #e3f2fd;
          color: #1976d2;
        }
        
        .event-type-badge.panel {
          background-color: #e8f5e9;
          color: #2e7d32;
        }
        
        .event-type-badge.workshop {
          background-color: #fff8e1;
          color: #f57f17;
        }
        
        .event-type-badge.networking {
          background-color: #e0f7fa;
          color: #00838f;
        }
        
        .event-type-badge.career_fair {
          background-color: #f3e5f5;
          color: #7b1fa2;
        }
        
        .event-type-badge.webinar {
          background-color: #e8eaf6;
          color: #3f51b5;
        }
        
        .event-type-badge.social {
          background-color: #fce4ec;
          color: #c2185b;
        }
        
        .event-status-badge.status-upcoming {
          background-color: #e3f2fd;
          color: #1976d2;
        }
        
        .event-status-badge.status-ongoing {
          background-color: #e8f5e9;
          color: #2e7d32;
        }
        
        .event-status-badge.status-past {
          background-color: #f5f5f5;
          color: #757575;
        }
        
        .event-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }
        
        .organizer-info {
          font-size: 0.875rem;
          color: var(--gray-600);
        }
        
        .organizer-name {
          font-weight: 500;
          color: var(--gray-800);
        }
        
        .event-stats {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .stat-item {
          text-align: center;
        }
        
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary);
          line-height: 1;
        }
        
        .stat-label {
          font-size: 0.75rem;
          color: var(--gray-600);
          margin-top: 0.25rem;
        }
        
        .btn-register,
        .btn-unregister {
          padding: 0.75rem 1.5rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 150px;
          text-align: center;
        }
        
        .btn-register {
          background-color: var(--primary);
          color: white;
          border: none;
        }
        
        .btn-register:hover:not(:disabled) {
          background-color: var(--primary-hover);
        }
        
        .btn-unregister {
          background-color: #f5f5f5;
          color: #d32f2f;
          border: 1px solid #f5c6cb;
        }
        
        .btn-unregister:hover:not(:disabled) {
          background-color: #feeaea;
        }
        
        .btn-register:disabled,
        .btn-unregister:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .event-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          padding: 2rem;
        }
        
        @media (max-width: 992px) {
          .event-content {
            grid-template-columns: 1fr;
          }
        }
        
        .event-date-time {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--gray-200);
        }
        
        .event-calendar {
          width: 80px;
          height: 80px;
          border-radius: 0.5rem;
          overflow: hidden;
          background-color: var(--primary);
          color: white;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .calendar-month {
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 500;
          padding: 0.25rem 0;
          background-color: rgba(0, 0, 0, 0.1);
        }
        
        .calendar-day {
          font-size: 2rem;
          font-weight: 700;
          padding: 0.5rem 0;
        }
        
        .event-time-location {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .event-detail {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: var(--gray-700);
        }
        
        .event-detail i {
          color: var(--gray-500);
          width: 1rem;
          text-align: center;
        }
        
        .event-duration {
          font-size: 0.75rem;
          color: var(--gray-600);
          margin-left: 0.5rem;
        }
        
        .event-description-section,
        .virtual-meeting-section,
        .what-to-expect-section {
          margin-bottom: 2rem;
        }
        
        .event-description-section h2,
        .virtual-meeting-section h2,
        .what-to-expect-section h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--gray-200);
        }
        
        .event-description {
          font-size: 0.875rem;
          color: var(--gray-700);
          line-height: 1.6;
        }
        
        .meeting-info {
          background-color: var(--gray-50);
          border-radius: 0.5rem;
          padding: 1.5rem;
          border-left: 4px solid #2196f3;
        }
        
        .meeting-info p {
          font-size: 0.875rem;
          color: var(--gray-700);
          margin-bottom: 1rem;
        }
        
        .btn-join-meeting {
          display: inline-flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          background-color: #2196f3;
          color: white;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: background-color 0.3s ease;
          margin-bottom: 1rem;
        }
        
        .btn-join-meeting i {
          margin-right: 0.5rem;
        }
        
        .btn-join-meeting:hover {
          background-color: #1976d2;
          color: white;
        }
        
        .meeting-note {
          font-style: italic;
          font-size: 0.75rem !important;
          color: var(--gray-600) !important;
          margin-bottom: 0 !important;
        }
        
        .expectation-items {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        
        .expectation-item {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          background-color: var(--gray-50);
          border-radius: 0.5rem;
          border-left: 3px solid var(--primary);
        }
        
        .expectation-item i {
          font-size: 1.5rem;
          color: var(--primary);
          flex-shrink: 0;
          margin-top: 0.25rem;
        }
        
        .expectation-content h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 0.5rem;
        }
        
        .expectation-content p {
          font-size: 0.75rem;
          color: var(--gray-700);
          line-height: 1.5;
        }
        
        .registration-card,
        .organizer-card,
        .share-card {
          background-color: var(--gray-50);
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .registration-card h3,
        .organizer-card h3,
        .share-card h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--gray-200);
        }
        
        .registration-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .info-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: var(--gray-700);
        }
        
        .info-item i {
          color: var(--gray-500);
          width: 1rem;
          text-align: center;
        }
        
        .registered-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background-color: #e8f5e9;
          color: #2e7d32;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }
        
        .btn-register-sidebar,
        .btn-unregister-sidebar {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }
        
        .btn-register-sidebar {
          background-color: var(--primary);
          color: white;
          border: none;
        }
        
        .btn-register-sidebar:hover:not(:disabled) {
          background-color: var(--primary-hover);
        }
        
        .btn-unregister-sidebar {
          background-color: white;
          color: #d32f2f;
          border: 1px solid #f5c6cb;
        }
        
        .btn-unregister-sidebar:hover:not(:disabled) {
          background-color: #feeaea;
        }
        
        .event-passed-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background-color: var(--gray-100);
          color: var(--gray-700);
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
        
        .organizer-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .organizer-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }
        
        .organizer-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .organizer-info h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 0.25rem;
        }
        
        .organizer-title {
          font-size: 0.75rem;
          color: var(--gray-600);
        }
        
        .share-buttons {
          display: flex;
          gap: 0.75rem;
        }
        
        .share-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }
        
        .share-btn.facebook {
          background-color: #3b5998;
        }
        
        .share-btn.twitter {
          background-color: #1da1f2;
        }
        
        .share-btn.linkedin {
          background-color: #0077b5;
        }
        
        .share-btn.email {
          background-color: #d14836;
        }
        
        .share-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
        }
        
        .not-found-message {
          background-color: var(--gray-100);
          border-radius: 0.5rem;
          padding: 3rem 2rem;
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .not-found-message h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 1rem;
        }
        
        .not-found-message p {
          color: var(--gray-600);
          margin-bottom: 1.5rem;
        }
        
        .btn-primary {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: var(--primary);
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s ease;
          text-decoration: none;
        }
        
        .btn-primary:hover {
          background-color: var(--primary-hover);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default EventDetail;