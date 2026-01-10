import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { FiUsers, FiFolder, FiPlus, FiTrash2, FiUserPlus, FiDownload, FiFileText, FiEye, FiEdit, FiMapPin } from 'react-icons/fi';
import LocationDashboard from '../components/Location/LocationDashboard';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectStats, setProjectStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'employee',
    department: 'general'
  });
  const [projectFormData, setProjectFormData] = useState({
    name: '',
    description: '',
    manager: '',
    members: [],
    salesEmployees: [],
    productionEmployees: [],
    startDate: '',
    endDate: '',
    status: 'active',
    department: 'general',
    projectValue: 0,
    clientName: '',
    profileName: '',
    platform: '',
    paidAmount: 0,
    remainingAmount: 0,
    remarks: ''
  });
  const [weeklyReportDates, setWeeklyReportDates] = useState({
    startDate: '',
    endDate: ''
  });
  const [salesReport, setSalesReport] = useState([]);
  const [showSalesReport, setShowSalesReport] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const isCEO = user?.role === 'ceo';
  const canManageUsers = ['ceo', 'co_ceo', 'company_manager'].includes(user?.role);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'projects') {
      fetchProjects();
    } else if (activeTab === 'projectStats') {
      fetchProjectStats();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await api.get('/projects');
      setProjects(response.data.projects);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/projects');
      const allProjects = response.data.projects;
      
      // Calculate statistics per project
      const stats = allProjects.map(project => ({
        projectId: project._id,
        projectName: project.name,
        clientName: project.clientName,
        platform: project.platform,
        department: project.department,
        status: project.status,
        projectValue: project.projectValue || 0,
        paidAmount: project.paidAmount || 0,
        remainingAmount: project.remainingAmount || 0,
        createdDate: project.createdAt,
        startDate: project.startDate,
        endDate: project.endDate,
        teamSize: project.members?.length || 0,
        teamMembers: project.members || [], // Store full members array
        createdBy: project.createdBy
      }));
      
      setProjectStats(stats);
    } catch (error) {
      toast.error('Failed to fetch project statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!isCEO) {
      toast.error('Only CEO can create users');
      return;
    }

    try {
      await api.post('/users', formData);
      toast.success('User created successfully');
      setShowCreateUserModal(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'employee',
        department: 'general'
      });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    if (!isCEO) {
      toast.error('Only CEO can change roles');
      return;
    }

    try {
      await api.put(`/users/${userId}`, { role: newRole });
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!isCEO) {
      toast.error('Only CEO can delete users');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleViewPassword = (user) => {
    if (!isCEO) {
      toast.error('Only CEO can view passwords');
      return;
    }
    setSelectedUser(user);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!isCEO) {
      toast.error('Only CEO can change passwords');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await api.put(`/users/${selectedUser._id}/password`, { password: newPassword });
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setSelectedUser(null);
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    try {
      // Combine sales and production employees into members array
      const allMembers = [
        ...projectFormData.salesEmployees,
        ...projectFormData.productionEmployees
      ];
      
      const projectData = {
        ...projectFormData,
        members: allMembers
      };
      
      await api.post('/projects', projectData);
      toast.success('Project created successfully with channel!');
      setShowCreateProjectModal(false);
      setProjectFormData({
        name: '',
        description: '',
        manager: '',
        members: [],
        salesEmployees: [],
        productionEmployees: [],
        startDate: '',
        endDate: '',
        status: 'active',
        department: 'general',
        projectValue: 0,
        clientName: '',
        profileName: '',
        platform: '',
        paidAmount: 0,
        remainingAmount: 0,
        remarks: ''
      });
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (!window.confirm(`Are you sure you want to delete project "${projectName}"?`)) {
      return;
    }

    try {
      await api.delete(`/projects/${projectId}`);
      toast.success('Project deleted successfully');
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleDownloadWeeklyReport = async () => {
    if (!weeklyReportDates.startDate || !weeklyReportDates.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    try {
      const response = await api.get('/eod/reports/weekly', {
        params: {
          startDate: weeklyReportDates.startDate,
          endDate: weeklyReportDates.endDate
        }
      });

      // Open HTML in new window for printing
      const newWindow = window.open('', '_blank');
      newWindow.document.write(response.data.html);
      newWindow.document.close();
      
      toast.success('Weekly report generated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate report');
    }
  };

  const fetchSalesReport = async () => {
    try {
      const response = await api.get('/users/sales-report');
      setSalesReport(response.data.salesEmployees);
      setShowSalesReport(true);
      toast.success('Sales report loaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch sales report');
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ceo':
        return 'role-badge ceo';
      case 'co_ceo':
        return 'role-badge co-ceo';
      case 'company_manager':
        return 'role-badge company-manager';
      case 'sales_head':
        return 'role-badge sales-head';
      case 'sales_employee':
        return 'role-badge sales-employee';
      case 'production_head':
        return 'role-badge production-head';
      case 'production_employee':
        return 'role-badge production-employee';
      case 'manager':
        return 'role-badge manager';
      default:
        return 'role-badge employee';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'status-badge active';
      case 'completed':
        return 'status-badge completed';
      case 'on-hold':
        return 'status-badge on-hold';
      case 'cancelled':
        return 'status-badge cancelled';
      default:
        return 'status-badge';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>{isCEO ? 'CEO Panel' : canManageUsers ? 'Management Panel' : 'Department Panel'}</h1>
        <p>{isCEO ? 'Full system management access' : canManageUsers ? 'View and manage your department' : 'Department management access'}</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FiUsers /> Users Management
        </button>
        <button
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <FiFolder /> Projects Management
        </button>
        <button
          className={`tab-btn ${activeTab === 'projectStats' ? 'active' : ''}`}
          onClick={() => setActiveTab('projectStats')}
        >
          <FiFolder /> Project Statistics
        </button>
        <button
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <FiFileText /> Weekly Reports
        </button>
        {isCEO && (
          <button
            className={`tab-btn ${activeTab === 'location' ? 'active' : ''}`}
            onClick={() => setActiveTab('location')}
          >
            <FiMapPin /> Location Tracking
          </button>
        )}
        {['ceo', 'co_ceo', 'company_manager', 'sales_head'].includes(user?.role) && (
          <button
            className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => { setActiveTab('sales'); fetchSalesReport(); }}
          >
            <FiDownload /> Sales Report
          </button>
        )}
      </div>

      {activeTab === 'users' && (
        <div className="tab-content">
          <div className="content-header">
            <h2>Users ({users.length})</h2>
            {isCEO && (
              <button className="create-btn" onClick={() => setShowCreateUserModal(true)}>
                <FiUserPlus /> Create New User
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Assigned Projects</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td data-label="Name">{u.firstName} {u.lastName}</td>
                      <td data-label="Email">{u.email}</td>
                      <td data-label="Username">@{u.username}</td>
                      <td data-label="Role">
                        {isCEO ? (
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                            className={getRoleBadgeClass(u.role)}
                          >
                            <option value="employee">Employee</option>
                            <option value="manager">Manager</option>
                            <option value="sales_employee">Sales Employee</option>
                            <option value="sales_head">Sales Head</option>
                            <option value="production_employee">Production Employee</option>
                            <option value="production_head">Production Head</option>
                            <option value="company_manager">Company Manager</option>
                            <option value="co_ceo">CO-CEO</option>
                            <option value="ceo">CEO</option>
                          </select>
                        ) : (
                          <span className={getRoleBadgeClass(u.role)}>
                            {u.role.replace('_', ' ').toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td data-label="Department">
                        <span className={`department-badge ${u.department}`}>
                          {u.department || 'general'}
                        </span>
                      </td>
                      <td data-label="Status">
                        <span className={`status-indicator ${u.status}`}>
                          {u.status}
                        </span>
                      </td>
                      <td data-label="Projects">{u.assignedProjects?.length || 0} projects</td>
                      <td data-label="Actions">
                        <div style={{display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
                          <button
                            className="btn-view"
                            onClick={() => navigate(`/dashboard/user-detail/${u._id}`)}
                            title="View Complete Details"
                            style={{fontSize: '12px', padding: '5px 10px'}}
                          >
                            <FiEye /> View Details
                          </button>
                          {canManageUsers && (
                            <button
                              className="btn-edit"
                              onClick={() => navigate(`/dashboard/edit-profile/${u._id}`)}
                              title="Edit Employee Profile"
                              style={{fontSize: '12px', padding: '5px 10px'}}
                            >
                              <FiEdit /> Edit Profile
                            </button>
                          )}
                          {isCEO && (
                            <>
                              <button
                                className="btn-primary"
                                onClick={() => handleViewPassword(u)}
                                title="View/Change Password"
                                style={{fontSize: '12px', padding: '5px 10px'}}
                              >
                                🔑 Password
                              </button>
                              <button
                                className="delete-btn-small"
                                onClick={() => handleDeleteUser(u._id, `${u.firstName} ${u.lastName}`)}
                                title="Delete user"
                              >
                                <FiTrash2 />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="tab-content">
          <div className="content-header">
            <h2>Projects ({projects.length})</h2>
            <button className="create-btn" onClick={() => setShowCreateProjectModal(true)}>
              <FiPlus /> Create New Project
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading projects...</div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <div key={project._id} className="project-card">
                  <div className="project-card-header">
                    <h3>{project.name}</h3>
                    <span className={getStatusBadgeClass(project.status)}>
                      {project.status}
                    </span>
                  </div>
                  
                  <p className="project-description">{project.description || 'No description'}</p>
                  
                  <div className="project-details">
                    <div className="detail-row">
                      <strong>Client:</strong> {project.clientName}
                    </div>
                    <div className="detail-row">
                      <strong>Profile:</strong> {project.profileName}
                    </div>
                    <div className="detail-row">
                      <strong>Platform:</strong> {project.platform}
                    </div>
                    <div className="detail-row">
                      <strong>Cost:</strong> <span style={{color: '#27ae60', fontWeight: 'bold'}}>${project.projectValue?.toLocaleString() || 0}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Paid:</strong> <span style={{color: '#e67e22', fontWeight: 'bold'}}>${project.paidAmount?.toLocaleString() || 0}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Remaining:</strong> <span style={{color: '#e74c3c', fontWeight: 'bold'}}>${project.remainingAmount?.toLocaleString() || 0}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Department:</strong> 
                      <span className={`department-badge ${project.department}`} style={{marginLeft: '8px'}}>
                        {project.department}
                      </span>
                    </div>
                    <div className="detail-row">
                      <strong>Created:</strong> {formatDate(project.createdAt)}
                    </div>
                  </div>

                  {project.remarks && (
                    <div className="project-remarks">
                      <strong>Remarks:</strong> {project.remarks}
                    </div>
                  )}
                  
                  <div className="project-dates">
                    <div className="date-item">
                      <strong>Start:</strong> {formatDate(project.startDate)}
                    </div>
                    <div className="date-item">
                      <strong>End:</strong> {formatDate(project.endDate)}
                    </div>
                  </div>

                  <div className="project-manager">
                    <strong>Created By:</strong>
                    <div className="user-chip">
                      <div className="user-avatar">
                        {project.createdBy?.firstName?.[0]}{project.createdBy?.lastName?.[0]}
                      </div>
                      {project.createdBy?.firstName} {project.createdBy?.lastName}
                    </div>
                  </div>

                  <div className="project-members">
                    <strong>Team Members ({project.members?.length || 0}):</strong>
                    <div className="members-list">
                      {project.members?.slice(0, 5).map((member) => (
                        <div key={member._id} className="member-chip" title={`${member.firstName} ${member.lastName}`}>
                          <div className="member-avatar">
                            {member.firstName?.[0]}{member.lastName?.[0]}
                          </div>
                          <span>{member.firstName} {member.lastName}</span>
                        </div>
                      ))}
                      {project.members?.length > 5 && (
                        <div className="member-chip more">+{project.members.length - 5} more</div>
                      )}
                    </div>
                  </div>

                  {project.channel && (
                    <div style={{marginTop: '10px', padding: '8px', background: '#f0f7ff', borderRadius: '6px', fontSize: '0.9em'}}>
                      <strong>💬 Channel:</strong> {project.channel.name}
                    </div>
                  )}

                  {isCEO && (
                    <div className="project-actions">
                      <button
                        className="delete-project-btn"
                        onClick={() => handleDeleteProject(project._id, project.name)}
                      >
                        <FiTrash2 /> Delete Project
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'projectStats' && (
        <div className="tab-content">
          <div className="content-header">
            <h2>📊 Project Statistics Overview</h2>
            <p>Comprehensive view of all projects with financial details</p>
          </div>

          {loading ? (
            <div className="loading">Loading project statistics...</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Client</th>
                    <th>Platform</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Team Members</th>
                    <th>Project Value ($)</th>
                    <th>Paid Amount ($)</th>
                    <th>Remaining ($)</th>
                    <th>Created Date</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Created By</th>
                  </tr>
                </thead>
                <tbody>
                  {projectStats.map((stat) => (
                    <tr key={stat.projectId}>
                      <td data-label="Project Name">
                        <strong style={{color: 'var(--text-primary)'}}>{stat.projectName}</strong>
                      </td>
                      <td data-label="Client">{stat.clientName}</td>
                      <td data-label="Platform">{stat.platform}</td>
                      <td data-label="Department">
                        <span className={`department-badge ${stat.department}`}>
                          {stat.department}
                        </span>
                      </td>
                      <td data-label="Status">
                        <span className={getStatusBadgeClass(stat.status)}>
                          {stat.status}
                        </span>
                      </td>
                      <td data-label="Team Members">
                        {stat.teamMembers && stat.teamMembers.length > 0 ? (
                          <div className="team-members-cell">
                            <div className="members-count-badge">
                              {stat.teamSize} {stat.teamSize === 1 ? 'Member' : 'Members'}
                            </div>
                            <div className="members-names-list">
                              {stat.teamMembers.map((member, idx) => (
                                <div key={member._id || idx} className="member-name-tag">
                                  {member.profilePicture ? (
                                    <img src={member.profilePicture} alt="" className="member-mini-avatar" />
                                  ) : (
                                    <div className="member-mini-avatar">
                                      {member.firstName?.[0]}{member.lastName?.[0]}
                                    </div>
                                  )}
                                  <span>{member.firstName} {member.lastName}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span style={{color: '#999', fontStyle: 'italic'}}>No team assigned</span>
                        )}
                      </td>
                      <td data-label="Project Value">
                        <strong style={{color: '#27ae60', fontSize: '1.1em'}}>
                          ${stat.projectValue.toLocaleString()}
                        </strong>
                      </td>
                      <td data-label="Paid Amount">
                        <strong style={{color: '#e67e22'}}>
                          ${stat.paidAmount.toLocaleString()}
                        </strong>
                      </td>
                      <td data-label="Remaining">
                        <strong style={{color: '#e74c3c'}}>
                          ${stat.remainingAmount.toLocaleString()}
                        </strong>
                      </td>
                      <td data-label="Created Date">{formatDate(stat.createdDate)}</td>
                      <td data-label="Start Date">{formatDate(stat.startDate)}</td>
                      <td data-label="End Date">{formatDate(stat.endDate)}</td>
                      <td data-label="Created By">
                        {stat.createdBy?.firstName} {stat.createdBy?.lastName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {projectStats.length === 0 && (
                <div className="empty-state">
                  <p>No projects found</p>
                </div>
              )}
              
              {/* Summary Section */}
              {projectStats.length > 0 && (
                <div style={{marginTop: '30px', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
                  <h3 style={{marginBottom: '15px', color: 'var(--text-primary)'}}>📈 Overall Summary</h3>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px'}}>
                    <div style={{padding: '15px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center'}}>
                      <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px'}}>Total Projects</div>
                      <div style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)'}}>
                        {projectStats.length}
                      </div>
                    </div>
                    <div style={{padding: '15px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center'}}>
                      <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px'}}>Total Value</div>
                      <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#27ae60'}}>
                        ${projectStats.reduce((sum, p) => sum + p.projectValue, 0).toLocaleString()}
                      </div>
                    </div>
                    <div style={{padding: '15px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center'}}>
                      <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px'}}>Total Paid</div>
                      <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#e67e22'}}>
                        ${projectStats.reduce((sum, p) => sum + p.paidAmount, 0).toLocaleString()}
                      </div>
                    </div>
                    <div style={{padding: '15px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center'}}>
                      <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px'}}>Total Remaining</div>
                      <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c'}}>
                        ${projectStats.reduce((sum, p) => sum + p.remainingAmount, 0).toLocaleString()}
                      </div>
                    </div>
                    <div style={{padding: '15px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center'}}>
                      <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px'}}>Active Projects</div>
                      <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#3498db'}}>
                        {projectStats.filter(p => p.status === 'active').length}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="tab-content">
          <div className="content-header">
            <h2>Weekly EOD Reports</h2>
          </div>

          <div className="report-generator">
            <div className="report-info">
              <h3>📊 Generate Weekly Performance Report</h3>
              <p>Download a comprehensive weekly report showing:</p>
              <ul>
                <li>✅ Total tasks completed by each employee</li>
                <li>⏰ Total hours worked per employee</li>
                <li>📈 Average hours per day</li>
                <li>📝 Number of EOD reports submitted</li>
                <li>🖊️ Signature fields for IT Manager, Office Manager, and CEO</li>
              </ul>
              <p className="report-note">
                <strong>Note:</strong> Report includes company branding (Radiant Solutions RS (PVT) LTD) and is print-ready.
              </p>
            </div>

            <div className="date-selector">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={weeklyReportDates.startDate}
                  onChange={(e) => setWeeklyReportDates({ ...weeklyReportDates, startDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={weeklyReportDates.endDate}
                  onChange={(e) => setWeeklyReportDates({ ...weeklyReportDates, endDate: e.target.value })}
                />
              </div>
            </div>

            <button className="download-report-btn" onClick={handleDownloadWeeklyReport}>
              <FiDownload /> Generate & Download Weekly Report
            </button>
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="tab-content">
          <div className="content-header">
            <h2>Sales Department Report</h2>
            <p>View all sales employees and their project values</p>
          </div>

          {loading ? (
            <div className="loading">Loading sales report...</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Sales Employee</th>
                    <th>Email</th>
                    <th>Total Projects</th>
                    <th>Project Details</th>
                    <th>Total Project Value ($)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReport.map((employee) => (
                    <tr key={employee._id}>
                      <td data-label="Name">{employee.firstName} {employee.lastName}</td>
                      <td data-label="Email">{employee.email}</td>
                      <td data-label="Projects">{employee.projectValues?.length || 0}</td>
                      <td data-label="Projects Details">
                        {employee.projectValues?.length > 0 ? (
                          <div style={{fontSize: '0.9em'}}>
                            {employee.projectValues.map((pv, idx) => (
                              <div key={idx} style={{padding: '4px 0', borderBottom: idx < employee.projectValues.length - 1 ? '1px solid #f0f0f0' : 'none'}}>
                                <strong>{pv.project?.name || 'Unknown Project'}</strong>: 
                                <span style={{color: '#27ae60', fontWeight: 'bold', marginLeft: '5px'}}>
                                  ${pv.value?.toLocaleString() || 0}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{color: '#999', fontStyle: 'italic'}}>No projects assigned</span>
                        )}
                      </td>
                      <td data-label="Total Value">
                        <strong style={{color: '#27ae60', fontSize: '1.2em'}}>
                          ${employee.totalProjectValue?.toLocaleString() || 0}
                        </strong>
                      </td>
                      <td data-label="Status">
                        <span className={`status-indicator ${employee.status}`}>
                          {employee.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {salesReport.length === 0 && (
                <div className="empty-state">
                  <p>No sales employees found</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'location' && isCEO && (
        <div className="tab-content">
          <LocationDashboard />
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="modal-overlay" onClick={() => setShowCreateUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New User</h2>
            <form onSubmit={handleCreateUser}>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="sales_employee">Sales Employee</option>
                    <option value="sales_head">Sales Head</option>
                    <option value="production_employee">Production Employee</option>
                    <option value="production_head">Production Head</option>
                    <option value="company_manager">Company Manager</option>
                    <option value="co_ceo">CO-CEO</option>
                    <option value="ceo">CEO</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="general">General</option>
                    <option value="sales">Sales</option>
                    <option value="production">Production</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateUserModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateProjectModal && (
        <div className="modal-overlay" onClick={() => setShowCreateProjectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  value={projectFormData.name}
                  onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={projectFormData.description}
                  onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={projectFormData.status}
                    onChange={(e) => setProjectFormData({ ...projectFormData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={projectFormData.startDate}
                    onChange={(e) => setProjectFormData({ ...projectFormData, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={projectFormData.endDate}
                    onChange={(e) => setProjectFormData({ ...projectFormData, endDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={projectFormData.department}
                    onChange={(e) => setProjectFormData({ ...projectFormData, department: e.target.value })}
                  >
                    <option value="general">General</option>
                    <option value="sales">Sales</option>
                    <option value="production">Production</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Project Value ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={projectFormData.projectValue}
                    onChange={(e) => setProjectFormData({ ...projectFormData, projectValue: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Client Name *</label>
                  <input
                    type="text"
                    value={projectFormData.clientName}
                    onChange={(e) => setProjectFormData({ ...projectFormData, clientName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Profile Name *</label>
                  <input
                    type="text"
                    value={projectFormData.profileName}
                    onChange={(e) => setProjectFormData({ ...projectFormData, profileName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Platform *</label>
                  <input
                    type="text"
                    value={projectFormData.platform}
                    onChange={(e) => setProjectFormData({ ...projectFormData, platform: e.target.value })}
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
                    value={projectFormData.paidAmount}
                    onChange={(e) => setProjectFormData({ ...projectFormData, paidAmount: parseFloat(e.target.value) || 0 })}
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
                    value={projectFormData.remainingAmount}
                    onChange={(e) => setProjectFormData({ ...projectFormData, remainingAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  value={projectFormData.remarks}
                  onChange={(e) => setProjectFormData({ ...projectFormData, remarks: e.target.value })}
                  rows={3}
                  placeholder="Additional notes or remarks"
                />
              </div>

              {/* Sales Employees Section */}
              <div className="form-group" style={{marginTop: '20px'}}>
                <label>Sales Team (Employees & Head)</label>
                <div style={{border: '1px solid #ddd', borderRadius: '8px', padding: '15px', maxHeight: '200px', overflowY: 'auto'}}>
                  {users.filter(u => u.role === 'sales_employee' || u.role === 'sales_head').length === 0 ? (
                    <p style={{color: '#999', fontStyle: 'italic'}}>No sales team members available</p>
                  ) : (
                    users.filter(u => u.role === 'sales_employee' || u.role === 'sales_head').map(u => (
                      <div key={u._id} style={{display: 'flex', alignItems: 'center', padding: '8px', borderBottom: '1px solid #f0f0f0'}}>
                        <input
                          type="checkbox"
                          id={`sales-${u._id}`}
                          checked={projectFormData.salesEmployees.includes(u._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProjectFormData({
                                ...projectFormData,
                                salesEmployees: [...projectFormData.salesEmployees, u._id]
                              });
                            } else {
                              setProjectFormData({
                                ...projectFormData,
                                salesEmployees: projectFormData.salesEmployees.filter(id => id !== u._id)
                              });
                            }
                          }}
                          style={{marginRight: '10px'}}
                        />
                        <label htmlFor={`sales-${u._id}`} style={{cursor: 'pointer', flex: 1}}>
                          <strong>{u.firstName} {u.lastName}</strong> 
                          {u.role === 'sales_head' && <span style={{color: '#27ae60', fontWeight: 'bold'}}> (Sales Head)</span>}
                          <span style={{color: '#666'}}> (@{u.username}) - {u.email}</span>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Production Employees Section */}
              <div className="form-group" style={{marginTop: '20px'}}>
                <label>Production Employees</label>
                <div style={{border: '1px solid #ddd', borderRadius: '8px', padding: '15px', maxHeight: '200px', overflowY: 'auto'}}>
                  {users.filter(u => u.role === 'production_employee').length === 0 ? (
                    <p style={{color: '#999', fontStyle: 'italic'}}>No production employees available</p>
                  ) : (
                    users.filter(u => u.role === 'production_employee').map(u => (
                      <div key={u._id} style={{display: 'flex', alignItems: 'center', padding: '8px', borderBottom: '1px solid #f0f0f0'}}>
                        <input
                          type="checkbox"
                          id={`prod-${u._id}`}
                          checked={projectFormData.productionEmployees.includes(u._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProjectFormData({
                                ...projectFormData,
                                productionEmployees: [...projectFormData.productionEmployees, u._id]
                              });
                            } else {
                              setProjectFormData({
                                ...projectFormData,
                                productionEmployees: projectFormData.productionEmployees.filter(id => id !== u._id)
                              });
                            }
                          }}
                          style={{marginRight: '10px'}}
                        />
                        <label htmlFor={`prod-${u._id}`} style={{cursor: 'pointer', flex: 1}}>
                          <strong>{u.firstName} {u.lastName}</strong> (@{u.username}) - {u.email}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px'}}>
                <p style={{margin: 0, color: '#666'}}>
                  <strong>Selected:</strong> {projectFormData.salesEmployees.length} Sales + {projectFormData.productionEmployees.length} Production = {projectFormData.salesEmployees.length + projectFormData.productionEmployees.length} Total Employees
                </p>
                <p style={{margin: '8px 0 0 0', color: '#999', fontSize: '0.9em'}}>
                  ℹ️ A project channel will be auto-created with CEO, managers, and all selected employees
                </p>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateProjectModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Project & Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Management Modal */}
      {showPasswordModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔑 Manage Password - {selectedUser.firstName} {selectedUser.lastName}</h2>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="user-info-display" style={{marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px'}}>
                <div style={{marginBottom: '10px'}}>
                  <strong>Username:</strong> {selectedUser.username}
                </div>
                <div style={{marginBottom: '10px'}}>
                  <strong>Email:</strong> {selectedUser.email}
                </div>
                <div style={{marginBottom: '10px'}}>
                  <strong>Role:</strong> <span style={{textTransform: 'capitalize'}}>{selectedUser.role?.replace('_', ' ')}</span>
                </div>
                <div style={{padding: '10px', background: '#fff3cd', borderRadius: '4px', marginTop: '10px'}}>
                  <strong style={{color: '#856404'}}>⚠️ Current Password:</strong>
                  <div style={{fontSize: '16px', fontFamily: 'monospace', color: '#000', marginTop: '5px', padding: '8px', background: 'white', borderRadius: '4px'}}>
                    {selectedUser.plainPassword || 'Password is encrypted (cannot be retrieved)'}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>New Password *</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  required
                  minLength={6}
                  autoFocus
                />
                <small style={{color: '#666', marginTop: '5px', display: 'block'}}>
                  💡 Tip: Use a combination of letters, numbers, and special characters
                </small>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  🔄 Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
