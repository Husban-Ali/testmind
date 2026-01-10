import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import './LeaveManagement.css';

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employeeStats, setEmployeeStats] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reviewModal, setReviewModal] = useState({ show: false, leave: null, action: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [leavePaymentStatus, setLeavePaymentStatus] = useState('paid');
  const [detailsModal, setDetailsModal] = useState({ show: false, employee: null, details: [] });
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updatingPaymentStatus, setUpdatingPaymentStatus] = useState({});
  const [addLeaveModal, setAddLeaveModal] = useState({ show: false });
  const [allEmployees, setAllEmployees] = useState([]);
  const [newLeaveData, setNewLeaveData] = useState({
    employeeId: '',
    leaveType: 'sick',
    leaveDates: [],
    reason: '',
    leavePaymentStatus: 'paid'
  });
  const [selectedLeaveDates, setSelectedLeaveDates] = useState([]);

  const fetchLeaveRequests = useCallback(async () => {
    try {
      setLoading(true);
      const statusParam = filterStatus !== 'all' ? `?status=${filterStatus}` : '';
      const response = await api.get(`/leaves/all-requests${statusParam}`);
      setLeaveRequests(response.data.leaves);
    } catch (err) {
      setError('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  const fetchEmployeeStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/leaves/employee-stats');
      setEmployeeStats(response.data.stats);
    } catch (err) {
      setError('Failed to fetch employee statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchLeaveRequests();
    } else {
      fetchEmployeeStats();
    }
    fetchAllEmployees();
  }, [activeTab, filterStatus, fetchLeaveRequests, fetchEmployeeStats]);

  const fetchAllEmployees = async () => {
    try {
      const response = await api.get('/users');
      setAllEmployees(response.data.users || []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const openReviewModal = (leave, action) => {
    setReviewModal({ show: true, leave, action });
    setRejectionReason('');
    setLeavePaymentStatus('paid');
  };

  const closeReviewModal = () => {
    setReviewModal({ show: false, leave: null, action: null });
    setRejectionReason('');
    setLeavePaymentStatus('paid');
  };

  const openDetailsModal = async (employeeId, employeeName) => {
    setLoadingDetails(true);
    setDetailsModal({ show: true, employee: { id: employeeId, name: employeeName }, details: [] });
    
    try {
      const response = await api.get(`/leaves/employee-details/${employeeId}`);
      setDetailsModal({ 
        show: true, 
        employee: response.data.employee, 
        details: response.data.details 
      });
    } catch (err) {
      setError('Failed to fetch employee details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDetailsModal = () => {
    setDetailsModal({ show: false, employee: null, details: [] });
  };

  const handleReview = async () => {
    try {
      const payload = {
        status: reviewModal.action,
        ...(reviewModal.action === 'rejected' && rejectionReason && { rejectionReason }),
        ...(reviewModal.action === 'approved' && { leavePaymentStatus })
      };

      await api.put(`/leaves/${reviewModal.leave._id}/review`, payload);

      setSuccess(`Leave request ${reviewModal.action} successfully!`);
      closeReviewModal();
      fetchLeaveRequests();
      if (activeTab === 'stats') fetchEmployeeStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to review leave request');
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
      sick: '🤒 Sick',
      casual: '🏖️ Casual',
      emergency: '🚨 Emergency',
      informed: '📢 Informed',
      uninformed: '⚠️ Uninformed',
      other: '📝 Other'
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

  const handlePaymentStatusChange = async (leaveId, newStatus) => {
    setUpdatingPaymentStatus({ ...updatingPaymentStatus, [leaveId]: true });
    
    try {
      await api.put(`/leaves/${leaveId}/payment-status`, {
        leavePaymentStatus: newStatus
      });
      
      // Refresh details
      const response = await api.get(`/leaves/employee-details/${detailsModal.employee.id}`);
      setDetailsModal({ 
        ...detailsModal,
        details: response.data.details 
      });
      
      setSuccess('Payment status updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payment status');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdatingPaymentStatus({ ...updatingPaymentStatus, [leaveId]: false });
    }
  };

  const openAddLeaveModal = () => {
    setAddLeaveModal({ show: true });
    setNewLeaveData({
      employeeId: '',
      leaveType: 'sick',
      leaveDates: [],
      reason: '',
      leavePaymentStatus: 'paid'
    });
    setSelectedLeaveDates([]);
  };

  const closeAddLeaveModal = () => {
    setAddLeaveModal({ show: false });
    setNewLeaveData({
      employeeId: '',
      leaveType: 'sick',
      leaveDates: [],
      reason: '',
      leavePaymentStatus: 'paid'
    });
    setSelectedLeaveDates([]);
  };

  const handleDateSelection = (dateStr) => {
    const dates = [...selectedLeaveDates];
    const index = dates.indexOf(dateStr);
    
    if (index > -1) {
      dates.splice(index, 1);
    } else {
      dates.push(dateStr);
    }
    
    dates.sort();
    setSelectedLeaveDates(dates);
    setNewLeaveData({ ...newLeaveData, leaveDates: dates });
  };

  const handleDateInputChange = (e) => {
    const date = e.target.value;
    if (date) {
      handleDateSelection(date);
      e.target.value = '';
    }
  };

  const removeDateFromSelection = (dateStr) => {
    const dates = selectedLeaveDates.filter(d => d !== dateStr);
    setSelectedLeaveDates(dates);
    setNewLeaveData({ ...newLeaveData, leaveDates: dates });
  };

  const handleAddLeave = async () => {
    if (!newLeaveData.employeeId) {
      setError('Please select an employee');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (selectedLeaveDates.length === 0) {
      setError('Please select at least one date');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!newLeaveData.reason.trim()) {
      setError('Please provide a reason');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setLoading(true);
      
      // Create leave request directly as approved
      await api.post('/leaves/add-by-management', {
        employeeId: newLeaveData.employeeId,
        leaveType: newLeaveData.leaveType,
        leaveDates: selectedLeaveDates,
        leaveCount: selectedLeaveDates.length,
        reason: newLeaveData.reason,
        leavePaymentStatus: newLeaveData.leavePaymentStatus
      });

      setSuccess('Leave added successfully!');
      setTimeout(() => setSuccess(''), 3000);
      closeAddLeaveModal();
      fetchLeaveRequests();
      if (activeTab === 'stats') fetchEmployeeStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add leave');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leave-management-container">
      <div className="management-header">
        <h1>Leave Management</h1>
        <div className="header-actions">
          <button className="btn-add-leave" onClick={openAddLeaveModal}>
            ➕ Add Leave for Employee
          </button>
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              📋 Leave Requests
            </button>
            <button
              className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              📊 Employee Statistics
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Leave Requests Tab */}
      {activeTab === 'requests' && (
        <div className="requests-section">
          <div className="filter-bar">
            <label>Filter by Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <p className="loading-text">Loading...</p>
          ) : leaveRequests.length === 0 ? (
            <p className="no-data">No leave requests found</p>
          ) : (
            <div className="requests-grid">
              {leaveRequests.map((leave) => (
                <div key={leave._id} className="request-card">
                  <div className="card-header">
                    <div className="employee-info">
                      <h3>{leave.employee?.firstName} {leave.employee?.lastName}</h3>
                      <span className="employee-email">{leave.employee?.email}</span>
                    </div>
                    {getStatusBadge(leave.status)}
                  </div>

                  <div className="card-body">
                    <div className="info-row">
                      <span className="label">Leave Type:</span>
                      <span className="value">{getLeaveTypeLabel(leave.leaveType)}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Days:</span>
                      <span className="value">{leave.leaveCount} day{leave.leaveCount > 1 ? 's' : ''}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Reason:</span>
                      <span className="value">{leave.reason}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Submitted:</span>
                      <span className="value">
                        {new Date(leave.createdAt).toLocaleDateString()} at{' '}
                        {new Date(leave.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    {leave.reviewedBy && (
                      <div className="review-info">
                        <p>
                          Reviewed by: {leave.reviewedBy.firstName} {leave.reviewedBy.lastName}
                          <br />
                          on {new Date(leave.reviewedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {leave.rejectionReason && (
                      <div className="rejection-box">
                        <strong>Rejection Reason:</strong> {leave.rejectionReason}
                      </div>
                    )}
                  </div>

                  {leave.status === 'pending' && (
                    <div className="card-actions">
                      <button
                        className="btn-approve"
                        onClick={() => openReviewModal(leave, 'approved')}
                      >
                        ✓ Approve
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => openReviewModal(leave, 'rejected')}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Employee Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="stats-section">
          {loading ? (
            <p className="loading-text">Loading...</p>
          ) : employeeStats.length === 0 ? (
            <p className="no-data">No employee data found</p>
          ) : (
            <div className="stats-table-container">
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Email</th>
                    <th>Joining Date</th>
                    <th>Total Leaves</th>
                    <th>💰 Paid</th>
                    <th>🚫 Unpaid</th>
                    <th>🤒 Sick</th>
                    <th>🏖️ Casual</th>
                    <th>🚨 Emergency</th>
                    <th>📢 Informed</th>
                    <th>⚠️ Uninformed</th>
                    <th>📝 Other</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeStats.map((stat) => (
                    <tr key={stat.employeeId}>
                      <td className="employee-name">{stat.employeeName}</td>
                      <td>{stat.email}</td>
                      <td>{new Date(stat.joiningDate).toLocaleDateString()}</td>
                      <td className="total-leaves">{stat.totalLeaves}</td>
                      <td>{stat.paidLeaves || 0}</td>
                      <td>{stat.unpaidLeaves || 0}</td>
                      <td>{stat.sick}</td>
                      <td>{stat.casual}</td>
                      <td>{stat.emergency}</td>
                      <td>{stat.informed}</td>
                      <td>{stat.uninformed}</td>
                      <td>{stat.other}</td>
                      <td>
                        <button 
                          className="btn-view-details"
                          onClick={() => openDetailsModal(stat.employeeId, stat.employeeName)}
                        >
                          📊 View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal.show && (
        <div className="modal-overlay" onClick={closeReviewModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>
              {reviewModal.action === 'approved' ? '✓ Approve' : '✗ Reject'} Leave Request
            </h2>
            <div className="modal-body">
              <p>
                <strong>Employee:</strong> {reviewModal.leave.employee?.firstName}{' '}
                {reviewModal.leave.employee?.lastName}
              </p>
              <p>
                <strong>Leave Type:</strong> {getLeaveTypeLabel(reviewModal.leave.leaveType)}
              </p>
              <p>
                <strong>Days:</strong> {reviewModal.leave.leaveCount}
              </p>
              <p>
                <strong>Reason:</strong> {reviewModal.leave.reason}
              </p>

              {reviewModal.action === 'approved' && (
                <div className="form-group">
                  <label>Payment Status *</label>
                  <div className="payment-status-options">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="paymentStatus"
                        value="paid"
                        checked={leavePaymentStatus === 'paid'}
                        onChange={(e) => setLeavePaymentStatus(e.target.value)}
                      />
                      <span>💰 Paid Leave</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="paymentStatus"
                        value="unpaid"
                        checked={leavePaymentStatus === 'unpaid'}
                        onChange={(e) => setLeavePaymentStatus(e.target.value)}
                      />
                      <span>🚫 Unpaid Leave</span>
                    </label>
                  </div>
                </div>
              )}

              {reviewModal.action === 'rejected' && (
                <div className="form-group">
                  <label>Rejection Reason (Optional):</label>
                  <textarea
                    rows="3"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a reason for rejection..."
                  />
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeReviewModal}>
                Cancel
              </button>
              <button
                className={reviewModal.action === 'approved' ? 'btn-approve' : 'btn-reject'}
                onClick={handleReview}
              >
                Confirm {reviewModal.action === 'approved' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Details Modal */}
      {detailsModal.show && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h2>📊 Leave Details - {detailsModal.employee?.name}</h2>
              <button className="close-modal-btn" onClick={closeDetailsModal}>×</button>
            </div>
            
            <div className="employee-info-header">
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{detailsModal.employee?.email}</span>
              </div>
              <div className="info-item">
                <span className="label">Joining Date:</span>
                <span className="value">{detailsModal.employee?.joiningDate ? new Date(detailsModal.employee.joiningDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            
            <div className="modal-body">
              {loadingDetails ? (
                <p className="loading-text">Loading details...</p>
              ) : detailsModal.details.length === 0 ? (
                <p className="no-data">No leave records found</p>
              ) : (
                <div className="details-table-container">
                  <table className="details-table">
                    <thead>
                      <tr>
                        <th>Leave Date</th>
                        <th>Leave Type</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Payment Status</th>
                        <th>Approved By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailsModal.details.map((detail, index) => (
                        <tr key={index}>
                          <td className="date-cell">
                            {detail.leaveDate 
                              ? format(new Date(detail.leaveDate), 'MMM dd, yyyy')
                              : `${detail.leaveCount} day(s)`
                            }
                          </td>
                          <td>{getLeaveTypeLabel(detail.leaveType)}</td>
                          <td className="reason-cell">{detail.reason}</td>
                          <td className="status-cell">{getStatusBadge(detail.status)}</td>
                          <td className="payment-cell">
                            {detail.status === 'approved' ? (
                              <div className="payment-status-control">
                                <select
                                  value={detail.leavePaymentStatus || 'pending'}
                                  onChange={(e) => handlePaymentStatusChange(detail.leaveId, e.target.value)}
                                  disabled={updatingPaymentStatus[detail.leaveId]}
                                >
                                  <option value="paid">💰 Paid</option>
                                  <option value="unpaid">🚫 Unpaid</option>
                                </select>
                              </div>
                            ) : (
                              getPaymentStatusBadge(detail.leavePaymentStatus)
                            )}
                          </td>
                          <td>{detail.approvedBy || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeDetailsModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Leave Modal */}
      {addLeaveModal.show && (
        <div className="modal-overlay" onClick={closeAddLeaveModal}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h2>➕ Add Leave for Employee</h2>
              <button className="close-modal-btn" onClick={closeAddLeaveModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Select Employee *</label>
                <select
                  value={newLeaveData.employeeId}
                  onChange={(e) => setNewLeaveData({ ...newLeaveData, employeeId: e.target.value })}
                  className="form-select"
                >
                  <option value="">-- Choose Employee --</option>
                  {allEmployees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Leave Type *</label>
                <select
                  value={newLeaveData.leaveType}
                  onChange={(e) => setNewLeaveData({ ...newLeaveData, leaveType: e.target.value })}
                  className="form-select"
                >
                  <option value="sick">🤒 Sick Leave</option>
                  <option value="casual">🏖️ Casual Leave</option>
                  <option value="emergency">🚨 Emergency Leave</option>
                  <option value="informed">📢 Informed Leave</option>
                  <option value="uninformed">⚠️ Uninformed Leave</option>
                  <option value="other">📝 Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Payment Status *</label>
                <div className="payment-status-options">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="newLeavePayment"
                      value="paid"
                      checked={newLeaveData.leavePaymentStatus === 'paid'}
                      onChange={(e) => setNewLeaveData({ ...newLeaveData, leavePaymentStatus: e.target.value })}
                    />
                    <span>💰 Paid Leave</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="newLeavePayment"
                      value="unpaid"
                      checked={newLeaveData.leavePaymentStatus === 'unpaid'}
                      onChange={(e) => setNewLeaveData({ ...newLeaveData, leavePaymentStatus: e.target.value })}
                    />
                    <span>🚫 Unpaid Leave</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Select Leave Dates *</label>
                <input
                  type="date"
                  className="date-picker-input"
                  onChange={handleDateInputChange}
                />
                
                {selectedLeaveDates.length > 0 && (
                  <div className="selected-dates-container">
                    <p className="selected-count">Selected: {selectedLeaveDates.length} day{selectedLeaveDates.length > 1 ? 's' : ''}</p>
                    <div className="dates-grid">
                      {selectedLeaveDates.map(date => (
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
                
                {selectedLeaveDates.length === 0 && (
                  <p className="hint-text">Select dates from the date picker above</p>
                )}
              </div>

              <div className="form-group">
                <label>Reason *</label>
                <textarea
                  rows="4"
                  value={newLeaveData.reason}
                  onChange={(e) => setNewLeaveData({ ...newLeaveData, reason: e.target.value })}
                  placeholder="Enter reason for leave..."
                  className="form-textarea"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeAddLeaveModal}>
                Cancel
              </button>
              <button 
                className="btn-approve" 
                onClick={handleAddLeave}
                disabled={loading}
              >
                {loading ? 'Adding...' : '✔ Add Leave'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
