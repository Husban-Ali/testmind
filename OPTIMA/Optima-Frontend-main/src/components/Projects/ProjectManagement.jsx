import React, { useState, useEffect } from 'react';
import { FiPlus, FiUsers } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store/authStore';
import './ProjectManagement.css';

function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const { user: currentUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: [],
    startDate: '',
    endDate: '',
    projectValue: 0,
    clientName: '',
    profileName: '',
    platform: '',
    paidAmount: 0,
    remainingAmount: 0,
    remarks: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        api.get('/projects'),
        api.get('/users')
      ]);
      setProjects(projectsRes.data.projects);
      setUsers(usersRes.data.users);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', formData);
      toast.success('Project created successfully!');
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        members: [],
        startDate: '',
        endDate: '',
        projectValue: 0,
        clientName: '',
        profileName: '',
        platform: '',
        paidAmount: 0,
        remainingAmount: 0,
        remarks: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleMemberToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  if (loading) {
    return <div className="project-management"><div className="loading">Loading...</div></div>;
  }

  // Filter employees based on current user's role
  let employees = [];
  if (currentUser?.role === 'sales_head') {
    // Sales Head can assign both sales and production employees
    employees = users.filter(u => ['sales_employee', 'production_employee'].includes(u.role));
  } else if (currentUser?.role === 'production_head') {
    // Production Head can assign both production and sales employees
    employees = users.filter(u => ['sales_employee', 'production_employee'].includes(u.role));
  } else {
    // CEO, CO-CEO, Company Manager can see all employees
    employees = users.filter(u => ['sales_employee', 'production_employee', 'employee'].includes(u.role));
  }

  return (
    <div className="project-management">
      <div className="projects-header">
        <h1><FiUsers /> Project Management</h1>
        {/* Production Head can only view projects, not create */}
        {currentUser?.role !== 'production_head' && (
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <FiPlus /> Create Project
          </button>
        )}
      </div>

      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="no-projects">
            <p>No projects yet. Create your first project!</p>
          </div>
        ) : (
          projects.map(project => (
            <div 
              key={project._id} 
              className="project-card"
              onClick={() => handleProjectClick(project)}
              style={{cursor: 'pointer'}}
            >
              <div className="project-card-header">
                <h3>{project.name}</h3>
                <span className={`project-status ${project.status}`}>
                  {project.status}
                </span>
              </div>
              <p className="project-description">{project.description}</p>
              
              {/* Team Members Section */}
              <div className="project-team-info">
                <div className="team-header">
                  <span className="label"><FiUsers /> Team Members</span>
                  <span className="count">{project.members?.length || 0}</span>
                </div>
                <div className="team-members-list">
                  {project.members && project.members.length > 0 ? (
                    project.members.slice(0, 3).map((member, index) => (
                      <div key={member._id} className="team-member-item">
                        {member.profilePicture ? (
                          <img src={member.profilePicture} alt={member.firstName} className="team-member-avatar-img" />
                        ) : (
                          <div className="team-member-avatar">
                            {member.firstName?.[0]}{member.lastName?.[0]}
                          </div>
                        )}
                        <span className="team-member-name">
                          {member.firstName} {member.lastName}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="no-members">No team members assigned</p>
                  )}
                  {project.members?.length > 3 && (
                    <div className="more-members">
                      +{project.members.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Project</h2>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Enter project name"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Project description"
                  rows="3"
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Project Value ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.projectValue}
                    onChange={(e) => setFormData({ ...formData, projectValue: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Client Name *</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Profile Name *</label>
                  <input
                    type="text"
                    value={formData.profileName}
                    onChange={(e) => setFormData({ ...formData, profileName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Platform *</label>
                  <input
                    type="text"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    placeholder="e.g. Fiverr, Upwork, Direct"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Paid Amount ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({ ...formData, paidAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Remaining Amount ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.remainingAmount}
                    onChange={(e) => setFormData({ ...formData, remainingAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={2}
                  placeholder="Optional remarks"
                />
              </div>
              <div className="form-group">
                <label>Assign Team Members</label>
                <div className="members-list">
                  {employees.length === 0 ? (
                    <p style={{ color: '#666', fontSize: '14px' }}>No employees available</p>
                  ) : (
                    employees.map(user => (
                      <label key={user._id} className="member-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.members.includes(user._id)}
                          onChange={() => handleMemberToggle(user._id)}
                        />
                        <span>{user.firstName} {user.lastName} ({user.department})</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {showDetailsModal && selectedProject && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProject.name}</h2>
              <span className={`project-status ${selectedProject.status}`}>
                {selectedProject.status}
              </span>
            </div>
            
            <div style={{padding: '20px'}}>
              {/* Description */}
              <div style={{marginBottom: '20px'}}>
                <h3 style={{fontSize: '16px', marginBottom: '10px', color: '#333'}}>Description</h3>
                <p style={{color: '#666', lineHeight: '1.6'}}>
                  {selectedProject.description || 'No description provided'}
                </p>
              </div>

              {/* Project Info */}
              <div style={{marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div>
                  <h3 style={{fontSize: '16px', marginBottom: '10px', color: '#333'}}>Start Date</h3>
                  <p style={{color: '#666'}}>
                    {selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div>
                  <h3 style={{fontSize: '16px', marginBottom: '10px', color: '#333'}}>End Date</h3>
                  <p style={{color: '#666'}}>
                    {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
              </div>

              {/* Team Members */}
              <div style={{marginBottom: '20px'}}>
                <h3 style={{fontSize: '16px', marginBottom: '15px', color: '#333'}}>Team Members ({selectedProject.members?.length || 0})</h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px'}}>
                  {selectedProject.members?.map(member => (
                    <div 
                      key={member._id} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px',
                        background: '#f8f9fa',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#0066cc',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        {member.firstName?.[0]}{member.lastName?.[0]}
                      </div>
                      <div>
                        <div style={{fontWeight: '500', color: '#333'}}>
                          {member.firstName} {member.lastName}
                        </div>
                        <div style={{fontSize: '12px', color: '#666'}}>
                          {member.username}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectManagement;
