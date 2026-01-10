import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import './LeaveRequest.css';

const LeaveRequest = () => {
  const [formData, setFormData] = useState({
    leaveType: 'sick',
    leaveCount: 1,
    leaveDates: [],
    reason: ''
  });
  const [selectedDates, setSelectedDates] = useState([]);
  const [dateInputMode, setDateInputMode] = useState('count'); // 'count' or 'dates'
  const [myRequests, setMyRequests] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMyRequests();
    fetchMyStats();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const response = await api.get('/leaves/my-requests');
      setMyRequests(response.data.leaves);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
    }
  };

  const fetchMyStats = async () => {
    try {
      const response = await api.get('/leaves/my-stats');
      setMyStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching leave stats:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        leaveType: formData.leaveType,
        reason: formData.reason
      };

      if (dateInputMode === 'dates' && selectedDates.length > 0) {
        payload.leaveDates = selectedDates;
        payload.leaveCount = selectedDates.length;
      } else {
        payload.leaveCount = formData.leaveCount;
        payload.leaveDates = [];
      }

      await api.post('/leaves', payload);

      setSuccess('Leave request submitted successfully!');
      setFormData({ leaveType: 'sick', leaveCount: 1, leaveDates: [], reason: '' });
      setSelectedDates([]);
      fetchMyRequests();
      fetchMyStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelection = (dateStr) => {
    const dates = [...selectedDates];
    const index = dates.indexOf(dateStr);
    
    if (index > -1) {
      dates.splice(index, 1);
    } else {
      dates.push(dateStr);
    }
    
    dates.sort();
    setSelectedDates(dates);
    setFormData({ ...formData, leaveDates: dates, leaveCount: dates.length });
  };

  const handleDateInputChange = (e) => {
    const date = e.target.value;
    if (date) {
      handleDateSelection(date);
      e.target.value = '';
    }
  };

  const removeDateFromSelection = (dateStr) => {
    const dates = selectedDates.filter(d => d !== dateStr);
    setSelectedDates(dates);
    setFormData({ ...formData, leaveDates: dates, leaveCount: dates.length });
  };

  const handleDelete = async (leaveId) => {
    if (!window.confirm('Are you sure you want to delete this leave request?')) return;

    try {
      await api.delete(`/leaves/${leaveId}`);
      setSuccess('Leave request deleted successfully');
      fetchMyRequests();
      fetchMyStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete leave request');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'status-pending', text: 'Pending' },
      approved: { class: 'status-approved', text: 'Approved' },
      rejected: { class: 'status-rejected', text: 'Rejected' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  const getLeaveTypeLabel = (type) => {
    const labels = {
      sick: 'Sick Leave',
      casual: 'Casual Leave',
      emergency: 'Emergency Leave',
      informed: 'Informed Leave',
      uninformed: 'Uninformed Leave',
      other: 'Other'
    };
    return labels[type] || type;
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    if (paymentStatus === 'paid') {
      return <span className="payment-badge paid">💰 Paid</span>;
    } else if (paymentStatus === 'unpaid') {
      return <span className="payment-badge unpaid">🚫 Unpaid</span>;
    } else {
      return <span className="payment-badge pending">⏳ Pending</span>;
    }
  };

  return (
    <div className="leave-request-container">
      <div className="leave-header">
        <h1>Leave Management</h1>
      </div>

      {/* Leave Statistics */}
      {myStats && (
        <div className="leave-stats-card">
          <h2>📊 My Leave Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Joining Date</span>
              <span className="stat-value">{new Date(myStats.joiningDate).toLocaleDateString()}</span>
            </div>
            <div className="stat-item highlight">
              <span className="stat-label">Total Leaves Taken</span>
              <span className="stat-value">{myStats.totalLeaves}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">🤒 Sick</span>
              <span className="stat-value">{myStats.sick}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">🏖️ Casual</span>
              <span className="stat-value">{myStats.casual}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">🚨 Emergency</span>
              <span className="stat-value">{myStats.emergency}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">📢 Informed</span>
              <span className="stat-value">{myStats.informed}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">⚠️ Uninformed</span>
              <span className="stat-value">{myStats.uninformed}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">📝 Other</span>
              <span className="stat-value">{myStats.other}</span>
            </div>
          </div>
        </div>
      )}

      {/* Submit Leave Request Form */}
      <div className="leave-form-card">
        <h2>Submit Leave Request</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Leave Type *</label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              required
            >
              <option value="sick">🤒 Sick Leave</option>
              <option value="casual">🏖️ Casual Leave</option>
              <option value="emergency">🚨 Emergency Leave</option>
              <option value="informed">📢 Informed Leave</option>
              <option value="uninformed">⚠️ Uninformed Leave</option>
              <option value="other">📝 Other</option>
            </select>
          </div>

          {/* Date Selection Mode Toggle */}
          <div className="form-group">
            <label>Leave Selection Method</label>
            <div className="date-mode-toggle">
              <button
                type="button"
                className={`mode-btn ${dateInputMode === 'count' ? 'active' : ''}`}
                onClick={() => {
                  setDateInputMode('count');
                  setSelectedDates([]);
                }}
              >
                📅 Number of Days
              </button>
              <button
                type="button"
                className={`mode-btn ${dateInputMode === 'dates' ? 'active' : ''}`}
                onClick={() => {
                  setDateInputMode('dates');
                  setFormData({ ...formData, leaveCount: 0 });
                }}
              >
                🗓️ Select Specific Dates
              </button>
            </div>
          </div>

          {/* Number of Days Input (Old Method) */}
          {dateInputMode === 'count' && (
            <div className="form-group">
              <label>Number of Days *</label>
              <input
                type="number"
                min="1"
                max="365"
                value={formData.leaveCount}
                onChange={(e) => setFormData({ ...formData, leaveCount: parseInt(e.target.value) })}
                required
              />
            </div>
          )}

          {/* Date Picker (New Method) */}
          {dateInputMode === 'dates' && (
            <div className="form-group">
              <label>Select Leave Dates *</label>
              <input
                type="date"
                className="date-picker-input"
                onChange={handleDateInputChange}
                min={new Date().toISOString().split('T')[0]}
              />
              
              {selectedDates.length > 0 && (
                <div className="selected-dates-container">
                  <p className="selected-count">Selected: {selectedDates.length} day{selectedDates.length > 1 ? 's' : ''}</p>
                  <div className="dates-grid">
                    {selectedDates.map(date => (
                      <div key={date} className="date-chip">
                        <span>{format(new Date(date), 'MMM dd, yyyy')}</span>
                        <button
                          type="button"
                          className="remove-date-btn"
                          onClick={() => removeDateFromSelection(date)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedDates.length === 0 && (
                <p className="hint-text">Click on the date picker above to select your leave dates</p>
              )}
            </div>
          )}

          <div className="form-group">
            <label>Reason *</label>
            <textarea
              rows="4"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Please provide a reason for your leave..."
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading || (dateInputMode === 'dates' && selectedDates.length === 0)}>
            {loading ? 'Submitting...' : 'Submit Leave Request'}
          </button>
        </form>
      </div>

      {/* My Leave Requests */}
      <div className="leave-requests-card">
        <h2>My Leave Requests</h2>
        {myRequests.length === 0 ? (
          <p className="no-data">No leave requests found</p>
        ) : (
          <div className="requests-list">
            {myRequests.map((leave) => (
              <div key={leave._id} className="request-item">
                <div className="request-header">
                  <div>
                    <strong>{getLeaveTypeLabel(leave.leaveType)}</strong>
                    <span className="leave-count"> ({leave.leaveCount} day{leave.leaveCount > 1 ? 's' : ''})</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {getStatusBadge(leave.status)}
                    {leave.status === 'approved' && getPaymentStatusBadge(leave.leavePaymentStatus)}
                  </div>
                </div>
                <div className="request-body">
                  <p><strong>Reason:</strong> {leave.reason}</p>
                  <p className="request-date">
                    Submitted on: {new Date(leave.createdAt).toLocaleDateString()} at {new Date(leave.createdAt).toLocaleTimeString()}
                  </p>
                  {leave.reviewedBy && (
                    <p className="reviewer-info">
                      Reviewed by: {leave.reviewedBy.firstName} {leave.reviewedBy.lastName} on {new Date(leave.reviewedAt).toLocaleDateString()}
                    </p>
                  )}
                  {leave.rejectionReason && (
                    <div className="rejection-reason">
                      <strong>Rejection Reason:</strong> {leave.rejectionReason}
                    </div>
                  )}
                </div>
                {leave.status === 'pending' && (
                  <div className="request-actions">
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(leave._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveRequest;
