import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getLearningPaths, 
  createLearningPath, 
  generateLearningPath,
  getLearningPathProgress,
  markLearningPathItemComplete
} from '../../services/learningService';
import { getSkills } from '../../services/profileService';
import './Learning.css';

const LearningPath = () => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [showNewPathForm, setShowNewPathForm] = useState(false);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pathProgress, setPathProgress] = useState({});
  
  // New path form state
  const [newPathTitle, setNewPathTitle] = useState('');
  const [newPathDescription, setNewPathDescription] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [creatingPath, setCreatingPath] = useState(false);
  const [formError, setFormError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch learning paths and skills in parallel
        const [pathsData, skillsData] = await Promise.all([
          getLearningPaths(),
          getSkills()
        ]);
        
        setLearningPaths(pathsData);
        setSkills(skillsData);
        
        // If there are paths, fetch progress for the first one
        if (pathsData.length > 0) {
          setSelectedPath(pathsData[0]);
          fetchPathProgress(pathsData[0].id);
        }
      } catch (err) {
        console.error('Error fetching learning paths:', err);
        setError('Failed to load learning paths. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const fetchPathProgress = async (pathId) => {
    try {
      const progress = await getLearningPathProgress(pathId);
      setPathProgress(prevProgress => ({
        ...prevProgress,
        [pathId]: progress
      }));
    } catch (err) {
      console.error(`Error fetching progress for path ${pathId}:`, err);
    }
  };
  
  const handleSelectPath = (path) => {
    setSelectedPath(path);
    
    // Fetch progress if we don't have it yet
    if (!pathProgress[path.id]) {
      fetchPathProgress(path.id);
    }
  };
  
  const handleCreatePath = async (e) => {
    e.preventDefault();
    
    if (!newPathTitle.trim()) {
      setFormError('Please enter a title for your learning path.');
      return;
    }
    
    if (selectedSkills.length === 0) {
      setFormError('Please select at least one skill for your learning path.');
      return;
    }
    
    try {
      setCreatingPath(true);
      setFormError(null);
      
      // Create the new learning path
      const newPath = await createLearningPath({
        title: newPathTitle,
        description: newPathDescription,
        target_skill_ids: selectedSkills
      });
      
      // Generate the path content
      await generateLearningPath(newPath.id);
      
      // Refresh the learning paths
      const updatedPaths = await getLearningPaths();
      setLearningPaths(updatedPaths);
      
      // Select the new path
      const createdPath = updatedPaths.find(path => path.id === newPath.id);
      if (createdPath) {
        setSelectedPath(createdPath);
        fetchPathProgress(createdPath.id);
      }
      
      // Reset form
      setNewPathTitle('');
      setNewPathDescription('');
      setSelectedSkills([]);
      setShowNewPathForm(false);
    } catch (err) {
      console.error('Error creating learning path:', err);
      setFormError('Failed to create learning path. Please try again.');
    } finally {
      setCreatingPath(false);
    }
  };
  
  const handleSkillChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedSkills([...selectedSkills, value]);
    } else {
      setSelectedSkills(selectedSkills.filter(skill => skill !== value));
    }
  };
  
  const handleCompleteItem = async (pathId, itemId) => {
    try {
      await markLearningPathItemComplete(pathId, itemId);
      
      // Update the UI optimistically
      setSelectedPath(prevPath => {
        if (!prevPath || prevPath.id !== pathId) return prevPath;
        
        return {
          ...prevPath,
          items: prevPath.items.map(item => 
            item.id === itemId ? { ...item, is_completed: true } : item
          )
        };
      });
      
      // Refresh the progress
      fetchPathProgress(pathId);
    } catch (err) {
      console.error(`Error marking item ${itemId} as complete:`, err);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading learning paths...</div>;
  }
  
  return (
    <div className="learning-path-page">
      <div className="page-header">
        <h1>Learning Paths</h1>
        <p>Personalized roadmaps to help you achieve your career goals</p>
      </div>
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}
      
      <div className="learning-path-content">
        <div className="path-sidebar">
          <div className="sidebar-header">
            <h2>Your Paths</h2>
            <button 
              className="btn-create-path" 
              onClick={() => setShowNewPathForm(!showNewPathForm)}
            >
              {showNewPathForm ? 'Cancel' : 'Create New Path'}
            </button>
          </div>
          
          {showNewPathForm && (
            <div className="new-path-form">
              <h3>Create New Learning Path</h3>
              
              {formError && (
                <div className="form-error">
                  <i className="fas fa-exclamation-circle"></i> {formError}
                </div>
              )}
              
              <form onSubmit={handleCreatePath}>
                <div className="form-group">
                  <label htmlFor="path-title">Path Title</label>
                  <input
                    type="text"
                    id="path-title"
                    value={newPathTitle}
                    onChange={(e) => setNewPathTitle(e.target.value)}
                    placeholder="e.g., Web Development Career Path"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="path-description">Description (Optional)</label>
                  <textarea
                    id="path-description"
                    value={newPathDescription}
                    onChange={(e) => setNewPathDescription(e.target.value)}
                    placeholder="Describe what you want to achieve with this path..."
                    rows="3"
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label>Target Skills</label>
                  <div className="skills-checkboxes">
                    {skills.map(skill => (
                      <div key={skill.id} className="skill-checkbox">
                        <input
                          type="checkbox"
                          id={`skill-${skill.id}`}
                          value={skill.id}
                          checked={selectedSkills.includes(skill.id.toString())}
                          onChange={handleSkillChange}
                        />
                        <label htmlFor={`skill-${skill.id}`}>{skill.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button type="submit" className="btn-primary" disabled={creatingPath}>
                  {creatingPath ? 'Creating Path...' : 'Create Learning Path'}
                </button>
              </form>
            </div>
          )}
          
          {learningPaths.length === 0 ? (
            <div className="no-paths-message">
              <p>You don't have any learning paths yet.</p>
              <button 
                className="btn-primary" 
                onClick={() => setShowNewPathForm(true)}
              >
                Create Your First Path
              </button>
            </div>
          ) : (
            <div className="paths-list">
              {learningPaths.map(path => (
                <div 
                  key={path.id} 
                  className={`path-item ${selectedPath?.id === path.id ? 'active' : ''}`}
                  onClick={() => handleSelectPath(path)}
                >
                  <h3>{path.title}</h3>
                  <div className="path-meta">
                    <span className="skills-count">
                      {path.target_skills.length} skills
                    </span>
                    <span className="items-count">
                      {path.items.length} items
                    </span>
                  </div>
                  {pathProgress[path.id] && (
                    <div className="path-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${pathProgress[path.id].progress_percentage}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {pathProgress[path.id].progress_percentage}% complete
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="path-details">
          {selectedPath ? (
            <>
              <div className="path-header">
                <h2>{selectedPath.title}</h2>
                {selectedPath.description && (
                  <p className="path-description">{selectedPath.description}</p>
                )}
                <div className="path-target-skills">
                  <h3>Target Skills</h3>
                  <div className="skills-tags">
                    {selectedPath.target_skills.map(skill => (
                      <span key={skill.id} className="skill-tag">{skill.name}</span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="path-items">
                <h3>Learning Path Items</h3>
                
                {selectedPath.items.length === 0 ? (
                  <div className="no-items-message">
                    <p>This learning path doesn't have any items yet.</p>
                    <button className="btn-primary">
                      Generate Path Items
                    </button>
                  </div>
                ) : (
                  <div className="items-list">
                    {selectedPath.items.sort((a, b) => a.order - b.order).map(item => (
                      <div key={item.id} className="path-item-card">
                        <div className="item-header">
                          <div className="item-type-badge">
                            {item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1)}
                          </div>
                          <div className="item-priority">
                            Priority: {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                          </div>
                        </div>
                        
                        <h4>{item.title}</h4>
                        {item.description && (
                          <p className="item-description">{item.description}</p>
                        )}
                        
                        <div className="item-meta">
                          <span className="estimated-time">
                            <i className="far fa-clock"></i> {item.estimated_completion_days} days
                          </span>
                        </div>
                        
                        <div className="item-actions">
                          {item.item_type === 'course' && item.course && (
                            <Link to={`/courses/${item.course.id}`} className="btn-view-course">
                              View Course
                            </Link>
                          )}
                          
                          {item.item_type === 'resource' && item.external_url && (
                            <a 
                              href={item.external_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="btn-visit-resource"
                            >
                              Visit Resource
                            </a>
                          )}
                          
                          {!item.is_completed ? (
                            <button 
                              className="btn-mark-complete"
                              onClick={() => handleCompleteItem(selectedPath.id, item.id)}
                            >
                              Mark as Complete
                            </button>
                          ) : (
                            <span className="completed-badge">
                              <i className="fas fa-check-circle"></i> Completed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-selection-message">
              <p>Select a learning path or create a new one to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPath;