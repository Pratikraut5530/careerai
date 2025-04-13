import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAlumniEvents, registerForEvent, unregisterFromEvent } from '../../services/alumniService';
import './Alumni.css';

const AlumniEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [eventType, setEventType] = useState('');
  const [timeframe, setTimeframe] = useState('upcoming');
  
  useEffect(() => {
    fetchEvents();
  }, []);
  
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getAlumniEvents();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching alumni events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegister = async (eventId) => {
    try {
      await registerForEvent(eventId);
      
      // Update the events state to reflect registration
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, is_registered: true, registration_count: event.registration_count + 1 }
          : event
      ));
    } catch (err) {
      console.error(`Error registering for event ${eventId}:`, err);
      alert('Failed to register for this event. Please try again.');
    }
  };
  
  const handleUnregister = async (eventId) => {
    try {
      await unregisterFromEvent(eventId);
      
      // Update the events state to reflect unregistration
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, is_registered: false, registration_count: event.registration_count - 1 }
          : event
      ));
    } catch (err) {
      console.error(`Error unregistering from event ${eventId}:`, err);
      alert('Failed to unregister from this event. Please try again.');
    }
  };
  
  // Apply filters
  const filteredEvents = events.filter(event => {
    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!event.title.toLowerCase().includes(term) && 
          !event.description.toLowerCase().includes(term)) {
        return false;
      }
    }
    
    // Event type
    if (eventType && event.event_type !== eventType) {
      return false;
    }
    
    // Timeframe
    const now = new Date();
    const eventStart = new Date(event.start_datetime);
    const eventEnd = new Date(event.end_datetime);
    
    if (timeframe === 'upcoming' && eventStart < now) {
      return false;
    } else if (timeframe === 'past' && eventStart >= now) {
      return false;
    } else if (timeframe === 'ongoing' && !(now >= eventStart && now <= eventEnd)) {
      return false;
    }
    
    return true;
  });
  
  // Group events by month for better organization
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const date = new Date(event.start_datetime);
    const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!acc[month]) {
      acc[month] = [];
    }
    
    acc[month].push(event);
    return acc;
  }, {});
  
  // Format date and time
  const formatDate = (dateString) => {
    const options = { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };
  
  // Determine event status badge
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
  
  if (loading) {
    return <div className="loading">Loading alumni events...</div>;
  }
  
  return (
    <div className="alumni-events-page">
      <div className="page-header">
        <h1>Alumni Events</h1>
        <p>Connect and engage with alumni through workshops, panels, and networking events</p>
      </div>
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}
      
      <div className="events-controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="event-filters">
          <div className="filter-group">
            <label>Event Type:</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="panel">Panel Discussion</option>
              <option value="workshop">Workshop</option>
              <option value="networking">Networking</option>
              <option value="career_fair">Career Fair</option>
              <option value="webinar">Webinar</option>
              <option value="social">Social Gathering</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Timeframe:</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="filter-select"
            >
              <option value="upcoming">Upcoming Events</option>
              <option value="ongoing">Ongoing Events</option>
              <option value="past">Past Events</option>
              <option value="all">All Events</option>
            </select>
          </div>
        </div>
      </div>
      
      {Object.keys(groupedEvents).length === 0 ? (
        <div className="no-events-message">
          <p>No events found matching your filters.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setEventType('');
              setTimeframe('upcoming');
            }} 
            className="btn-primary"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="events-content">
          {Object.entries(groupedEvents).map(([month, monthEvents]) => (
            <div key={month} className="events-month-group">
              <h2 className="month-heading">{month}</h2>
              
              <div className="events-list">
                {monthEvents.map(event => {
                  const status = getEventStatus(event);
                  
                  return (
                    <div key={event.id} className="event-card">
                      <div className="event-card-header">
                        <span className={`event-type-badge ${event.event_type}`}>
                          {event.event_type.replace('_', ' ').charAt(0).toUpperCase() + event.event_type.replace('_', ' ').slice(1)}
                        </span>
                        <span className={`event-status-badge ${status.class}`}>
                          {status.text}
                        </span>
                      </div>
                      
                      <h3 className="event-title">{event.title}</h3>
                      
                      <div className="event-details">
                        <div className="event-detail">
                          <i className="far fa-calendar-alt"></i>
                          <span>{formatDate(event.start_datetime)}</span>
                        </div>
                        
                        <div className="event-detail">
                          <i className="far fa-clock"></i>
                          <span>
                            {formatTime(event.start_datetime)} - {formatTime(event.end_datetime)}
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
                        
                        <div className="event-detail">
                          <i className="fas fa-users"></i>
                          <span>{event.registration_count} registered</span>
                        </div>
                      </div>
                      
                      <p className="event-description">
                        {event.description.length > 150 
                          ? `${event.description.substring(0, 150)}...` 
                          : event.description}
                      </p>
                      
                      <div className="event-actions">
                        <Link to={`/alumni-events/${event.id}`} className="btn-view-details">
                          View Details
                        </Link>
                        
                        {new Date(event.start_datetime) > new Date() && (
                          event.is_registered ? (
                            <button 
                              className="btn-unregister" 
                              onClick={() => handleUnregister(event.id)}
                            >
                              Cancel Registration
                            </button>
                          ) : (
                            <button 
                              className="btn-register" 
                              onClick={() => handleRegister(event.id)}
                            >
                              Register
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <style jsx>{`
        .alumni-events-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        
        .page-header {
          margin-bottom: 2rem;
        }
        
        .page-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--gray-900);
        }
        
        .page-header p {
          color: var(--gray-600);
          font-size: 1rem;
        }
        
        .events-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
          background-color: var(--white);
          padding: 1.5rem;
          border-radius: 0.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .search-filter {
          flex: 1;
          min-width: 250px;
        }
        
        .search-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--gray-300);
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
        
        .search-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
        }
        
        .event-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .filter-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-700);
          white-space: nowrap;
        }
        
        .filter-select {
          padding: 0.75rem;
          border: 1px solid var(--gray-300);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          min-width: 150px;
        }
        
        .filter-select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
        }
        
        .no-events-message {
          background-color: var(--gray-100);
          border-radius: 0.5rem;
          padding: 3rem 2rem;
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .no-events-message p {
          margin-bottom: 1.5rem;
          color: var(--gray-600);
        }
        
        .month-heading {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--gray-200);
        }
        
        .events-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        
        @media (max-width: 768px) {
          .events-list {
            grid-template-columns: 1fr;
          }
        }
        
        .event-card {
          background-color: var(--white);
          border-radius: 0.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .event-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        }
        
        .event-card-header {
          display: flex;
          justify-content: space-between;
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
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 1rem;
          line-height: 1.4;
        }
        
        .event-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .event-detail {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--gray-600);
        }
        
        .event-detail i {
          color: var(--gray-500);
          width: 1rem;
          text-align: center;
        }
        
        .event-description {
          font-size: 0.875rem;
          color: var(--gray-700);
          margin-bottom: 1.5rem;
          line-height: 1.5;
          flex-grow: 1;
        }
        
        .event-actions {
          display: flex;
          gap: 1rem;
          margin-top: auto;
        }
        
        .btn-view-details,
        .btn-register,
        .btn-unregister {
          padding: 0.625rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
        }
        
        .btn-view-details {
          background-color: var(--gray-100);
          color: var(--gray-700);
          border: 1px solid var(--gray-300);
        }
        
        .btn-view-details:hover {
          background-color: var(--gray-200);
        }
        
        .btn-register {
          background-color: var(--primary);
          color: white;
          border: none;
        }
        
        .btn-register:hover {
          background-color: var(--primary-hover);
        }
        
        .btn-unregister {
          background-color: #f5f5f5;
          color: #d32f2f;
          border: 1px solid #f5c6cb;
        }
        
        .btn-unregister:hover {
          background-color: #feeaea;
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
        }
        
        .btn-primary:hover {
          background-color: var(--primary-hover);
        }
        
        .events-month-group {
          margin-bottom: 2.5rem;
        }
      `}</style>
    </div>
  );
};

export default AlumniEvents;