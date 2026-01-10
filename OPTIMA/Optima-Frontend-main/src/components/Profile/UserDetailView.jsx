import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiCreditCard, FiCalendar, FiFileText, FiMapPin, FiBriefcase } from 'react-icons/fi';
import './UserDetailView.css';

const UserDetailView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await api.get(`/profile/user/${userId}`);
      setData(response.data.data);
    } catch (error) {
      toast.error('Failed to load user details');
      navigate('/dashboard/admin');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'status-pending', text: 'Pending' },
      approved: { class: 'status-approved', text: 'Approved' },
      rejected: { class: 'status-rejected', text: 'Rejected' },
      submitted: { class: 'status-pending', text: 'Submitted' },
      reviewed: { class: 'status-approved', text: 'Reviewed' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  const getLeaveTypeLabel = (type) => {
    const labels = {
      sick: '🤒 Sick',
      casual: '🏖️ Casual',
      emergency: '🚨 Emergency',
      informed: '📢 Informed',
      uninformed: '⚠️ Uninformed',
      other: '📝 Other'
    };
    return labels[type] || type;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="user-detail-loading">Loading user details...</div>;
  }

  if (!data) {
    return <div className="user-detail-error">User not found</div>;
  }

  const { user, eodReports, leaveStats, leaveHistory, joiningDate } = data;

  return (
    <div className="user-detail-container">
      {/* Header */}
      <div className="user-detail-header">
        <button className="back-btn" onClick={() => navigate('/dashboard/admin')}>
          <FiArrowLeft /> Back to Admin Panel
        </button>
        <h1>👤 User Details - {user.firstName} {user.lastName}</h1>
      </div>

      {/* User Profile Card */}
      <div className="detail-card profile-overview">
        <h2>Profile Information</h2>
        <div className="profile-content">
          <div className="profile-picture-section">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="profile-img" />
            ) : (
              <div className="profile-avatar">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
            )}
          </div>
          
          <div className="profile-info-grid">
            <div className="info-row">
              <span className="info-label"><FiUser /> Full Name</span>
              <span className="info-value">{user.firstName} {user.lastName}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><FiUser /> Father Name</span>
              <span className="info-value">{user.fatherName || 'Not provided'}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><FiCalendar /> Date of Birth</span>
              <span className="info-value">{user.dateOfBirth ? formatDate(user.dateOfBirth) : 'Not provided'}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><FiUser /> Gender</span>
              <span className="info-value">{user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not provided'}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><FiMail /> Company Email</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><FiMail /> Personal Email</span>
              <span className="info-value">{user.personalEmail || 'Not provided'}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><FiPhone /> Phone Number</span>
              <span className="info-value">{user.phoneNumber || 'Not provided'}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><FiCreditCard /> CNIC Number</span>
              <span className="info-value">{user.cnicNumber || 'Not provided'}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><FiMapPin /> Current Address</span>
              <span className="info-value">{user.currentAddress || 'Not provided'}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><FiMapPin /> Permanent Address</span>
              <span className="info-value">{user.permanentAddress || 'Not provided'}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><FiBriefcase /> Employee ID</span>
              <span className="info-value">{user.employeeId || 'Not assigned'}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><FiBriefcase /> Designation</span>
              <span className="info-value">{user.designation || 'Not assigned'}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><FiCalendar /> Joining Date</span>
              <span className="info-value">{formatDate(user.joiningDate || joiningDate)}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><FiBriefcase /> Employment Type</span>
              <span className="info-value">{user.employmentType ? user.employmentType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Not specified'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Username</span>
              <span className="info-value">@{user.username}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Role</span>
              <span className="info-value role-badge">{user.role?.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Department</span>
              <span className="info-value dept-badge">{user.department?.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* CNIC Images */}
        {(user.cnicFrontImage || user.cnicBackImage) && (
          <div className="cnic-images-section">
            <h3>CNIC Images</h3>
            <div className="cnic-grid">
              {user.cnicFrontImage && (
                <div className="cnic-card">
                  <h4>CNIC Front</h4>
                  <img src={user.cnicFrontImage} alt="CNIC Front" />
                </div>
              )}
              {user.cnicBackImage && (
                <div className="cnic-card">
                  <h4>CNIC Back</h4>
                  <img src={user.cnicBackImage} alt="CNIC Back" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FiUser /> Profile
        </button>
        <button
          className={`tab-btn ${activeTab === 'eod' ? 'active' : ''}`}
          onClick={() => setActiveTab('eod')}
        >
          <FiFileText /> EOD Reports ({eodReports.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'leaves' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaves')}
        >
          <FiCalendar /> Leave Summary
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="detail-card">
          <h2>Complete Profile</h2>
          <p className="tab-message">All profile information is displayed above.</p>
        </div>
      )}

      {activeTab === 'eod' && (
        <div className="detail-card">
          <h2>📄 EOD Reports History</h2>
          {eodReports.length === 0 ? (
            <p className="no-data">No EOD reports found</p>
          ) : (
            <div className="eod-list">
              {eodReports.map((report) => (
                <div key={report._id} className="eod-item">
                  <div className="eod-header">
                    <span className="eod-date">
                      <FiCalendar /> {formatDate(report.date)}
                    </span>
                    {getStatusBadge(report.status)}
                  </div>
                  
                  <div className="eod-content">
                    {report.content && (
                      <div className="eod-section">
                        <strong>Content:</strong>
                        <p>{report.content}</p>
                      </div>
                    )}
                    
                    {report.tasksCompleted?.length > 0 && (
                      <div className="eod-section">
                        <strong>✅ Tasks Completed ({report.tasksCompleted.length}):</strong>
                        <ul>
                          {report.tasksCompleted.map((task, idx) => (
                            <li key={idx}>{task}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {report.tasksInProgress?.length > 0 && (
                      <div className="eod-section">
                        <strong>⏳ Tasks In Progress ({report.tasksInProgress.length}):</strong>
                        <ul>
                          {report.tasksInProgress.map((task, idx) => (
                            <li key={idx}>{task}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {report.blockers?.length > 0 && (
                      <div className="eod-section">
                        <strong>🚧 Blockers ({report.blockers.length}):</strong>
                        <ul>
                          {report.blockers.map((blocker, idx) => (
                            <li key={idx}>{blocker}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="eod-meta">
                      <span>⏰ Hours Worked: <strong>{report.hoursWorked || 0}</strong></span>
                      {report.reviewedBy && (
                        <span>
                          Reviewed by: <strong>{report.reviewedBy.firstName} {report.reviewedBy.lastName}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="detail-card">
          <h2>🌴 Leave Summary</h2>
          
          {/* Leave Statistics */}
          <div className="leave-stats-grid">
            <div className="stat-card highlight">
              <div className="stat-label">Total Leaves Taken</div>
              <div className="stat-value">{leaveStats.totalLeaves}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">🤒 Sick</div>
              <div className="stat-value">{leaveStats.sick}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">🏖️ Casual</div>
              <div className="stat-value">{leaveStats.casual}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">🚨 Emergency</div>
              <div className="stat-value">{leaveStats.emergency}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">📢 Informed</div>
              <div className="stat-value">{leaveStats.informed}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">⚠️ Uninformed</div>
              <div className="stat-value">{leaveStats.uninformed}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">📝 Other</div>
              <div className="stat-value">{leaveStats.other}</div>
            </div>
          </div>

          {/* Leave History */}
          <h3 style={{ marginTop: '30px', marginBottom: '20px' }}>Leave Request History</h3>
          {leaveHistory.length === 0 ? (
            <p className="no-data">No leave requests found</p>
          ) : (
            <div className="leave-list">
              {leaveHistory.map((leave) => (
                <div key={leave._id} className="leave-item">
                  <div className="leave-header">
                    <div>
                      <strong>{getLeaveTypeLabel(leave.leaveType)}</strong>
                      <span className="leave-count"> ({leave.leaveCount} day{leave.leaveCount > 1 ? 's' : ''})</span>
                    </div>
                    {getStatusBadge(leave.status)}
                  </div>
                  <div className="leave-body">
                    <p><strong>Reason:</strong> {leave.reason}</p>
                    <p className="leave-date">
                      Submitted on: {formatDate(leave.createdAt)}
                    </p>
                    {leave.reviewedBy && (
                      <p className="reviewer-info">
                        Reviewed by: {leave.reviewedBy.firstName} {leave.reviewedBy.lastName} on {formatDate(leave.reviewedAt)}
                      </p>
                    )}
                    {leave.rejectionReason && (
                      <div className="rejection-reason">
                        <strong>Rejection Reason:</strong> {leave.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDetailView;
