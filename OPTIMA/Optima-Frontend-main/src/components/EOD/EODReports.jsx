import React, { useState, useEffect } from 'react';
import { FiFileText, FiPlus, FiCheck, FiClock } from 'react-icons/fi';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import './EODReports.css';

function EODReports() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    content: '',
    tasksCompleted: [''],
    tasksInProgress: [''],
    blockers: [''],
    hoursWorked: 0
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/eod');
      setReports(response.data.reports);
    } catch (error) {
      // Handle unauthorized access errors specifically
      if (error.response?.status === 403) {
        toast.error(error.response.data.message || 'Not authorized to view these reports');
      } else if (error.response?.status === 500) {
        toast.error('Server error occurred. Please try again later.');
      } else {
        toast.error('Failed to fetch EOD reports');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    
    // Frontend validation
    const hasTasksCompleted = formData.tasksCompleted.some(t => t.trim());
    const hasTasksInProgress = formData.tasksInProgress.some(t => t.trim());
    const hasBlockers = formData.blockers.some(b => b.trim());
    const hasContent = formData.content.trim();
    const hasHoursWorked = formData.hoursWorked > 0;

    if (!hasTasksCompleted && !hasTasksInProgress && !hasBlockers && !hasContent && !hasHoursWorked) {
      toast.error('Please provide at least one of: Tasks Completed, Tasks In Progress, Blockers, Additional Notes, or Hours Worked');
      return;
    }

    // Prepare data for submission
    const dataToSubmit = {
      ...formData,
      tasksCompleted: formData.tasksCompleted.filter(t => t.trim()),
      tasksInProgress: formData.tasksInProgress.filter(t => t.trim()),
      blockers: formData.blockers.filter(t => t.trim())
    };

    // Show confirmation popup
    setPendingSubmitData(dataToSubmit);
    setShowConfirmSubmit(true);
  };

  const confirmSubmitReport = async () => {
    if (!pendingSubmitData) return;

    try {
      await api.post('/eod', pendingSubmitData);
      toast.success('EOD report submitted successfully!');
      setShowCreateModal(false);
      setShowConfirmSubmit(false);
      setPendingSubmitData(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        content: '',
        tasksCompleted: [''],
        tasksInProgress: [''],
        blockers: [''],
        hoursWorked: 0
      });
      fetchReports();
    } catch (error) {
      // Handle specific error messages from backend
      if (error.response?.status === 403) {
        toast.error(error.response.data.message || 'Not authorized to submit reports');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Validation error');
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit report');
      }
    }
  };

  const cancelSubmitReport = () => {
    setShowConfirmSubmit(false);
    setPendingSubmitData(null);
  };

  const handleTaskChange = (type, index, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => i === index ? value : item)
    }));
  };

  const addTaskField = (type) => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], '']
    }));
  };

  const removeTaskField = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  // Check if user can submit EOD reports
  // Company Manager CAN submit reports, but their reports are restricted
  const canSubmitReports = !['ceo', 'co_ceo', 'manager'].includes(user?.role);

  // Check if user can view all reports (CEO, Co-CEO)
  const canViewAllReports = ['ceo', 'co_ceo'].includes(user?.role);

  if (loading) {
    return <div className="eod-reports"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="eod-reports">
      <div className="eod-header">
        <h1><FiFileText /> EOD Reports</h1>
        {canSubmitReports && (
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <FiPlus /> Submit Today's Report
          </button>
        )}
      </div>

      {/* Show notice for Company Managers about report visibility */}
      {user?.role === 'company_manager' && (
        <div className="info-banner">
          <p>ℹ️ Your EOD reports are restricted and can only be viewed by CEO and Co-CEO</p>
        </div>
      )}

      {/* Show notice for users who can't view Company Manager reports */}
      {!canViewAllReports && !['company_manager'].includes(user?.role) && (
        <div className="info-banner">
          <p>ℹ️ Company Manager reports are restricted and only visible to CEO and Co-CEO</p>
        </div>
      )}

      <div className="reports-list">
        {reports.length === 0 ? (
          <div className="no-reports">
            <p>No EOD reports yet. {canSubmitReports ? 'Submit your first report!' : 'Reports will appear here.'}</p>
          </div>
        ) : (
          reports.map(report => (
            <div key={report._id} className="report-card">
              <div className="report-header">
                <div className="report-user">
                  <div className="user-avatar-small">
                    {report.user?.firstName?.[0]}{report.user?.lastName?.[0]}
                  </div>
                  <div>
                    <div className="user-name">
                      {report.user?.firstName} {report.user?.lastName}
                      {report.user?.role === 'company_manager' && (
                        <span className="role-tag company-manager">Company Manager</span>
                      )}
                    </div>
                    <div className="report-date">
                      {new Date(report.date).toLocaleDateString()} • {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <span className={`report-status ${report.status}`}>
                  {report.status === 'submitted' && <FiClock />}
                  {report.status === 'approved' && <FiCheck />}
                  {report.status}
                </span>
              </div>

              <div className="report-content">
                {report.tasksCompleted?.length > 0 && (
                  <div className="report-section">
                    <h4>✅ Tasks Completed</h4>
                    <ul>
                      {report.tasksCompleted.map((task, idx) => (
                        <li key={idx}>{task}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.tasksInProgress?.length > 0 && (
                  <div className="report-section">
                    <h4>🔄 Tasks In Progress</h4>
                    <ul>
                      {report.tasksInProgress.map((task, idx) => (
                        <li key={idx}>{task}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.blockers?.length > 0 && (
                  <div className="report-section">
                    <h4>🚧 Blockers</h4>
                    <ul>
                      {report.blockers.map((blocker, idx) => (
                        <li key={idx}>{blocker}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.content && (
                  <div className="report-section">
                    <h4>📝 Additional Notes</h4>
                    <p>{report.content}</p>
                  </div>
                )}

                {report.hoursWorked > 0 && (
                  <div className="report-hours">
                    ⏰ Hours Worked: <strong>{report.hoursWorked}</strong>
                  </div>
                )}
              </div>
              
              {/* Show visibility notice for Company Manager reports */}
              {report.user?.role === 'company_manager' && !canViewAllReports && (
                <div className="restricted-notice">
                  <p>This report is restricted and can only be viewed by CEO and Co-CEO</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Submit EOD Report</h2>
            </div>
            <div className="info-banner" style={{ marginBottom: '20px' }}>
              <p>ℹ️ Please fill at least one field: Tasks Completed, Tasks In Progress, Blockers, Additional Notes, or Hours Worked</p>
            </div>
            <form onSubmit={handleSubmitReport}>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tasks Completed Today (Optional)</label>
                {formData.tasksCompleted.map((task, idx) => (
                  <div key={idx} className="task-input-row">
                    <input
                      type="text"
                      value={task}
                      onChange={(e) => handleTaskChange('tasksCompleted', idx, e.target.value)}
                      placeholder="Enter completed task"
                    />
                    {idx > 0 && (
                      <button type="button" onClick={() => removeTaskField('tasksCompleted', idx)} className="remove-btn">
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addTaskField('tasksCompleted')} className="add-task-btn">
                  + Add Task
                </button>
              </div>

              <div className="form-group">
                <label>Tasks In Progress (Optional)</label>
                {formData.tasksInProgress.map((task, idx) => (
                  <div key={idx} className="task-input-row">
                    <input
                      type="text"
                      value={task}
                      onChange={(e) => handleTaskChange('tasksInProgress', idx, e.target.value)}
                      placeholder="Enter task in progress"
                    />
                    {idx > 0 && (
                      <button type="button" onClick={() => removeTaskField('tasksInProgress', idx)} className="remove-btn">
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addTaskField('tasksInProgress')} className="add-task-btn">
                  + Add Task
                </button>
              </div>

              <div className="form-group">
                <label>Blockers / Issues (Optional)</label>
                {formData.blockers.map((blocker, idx) => (
                  <div key={idx} className="task-input-row">
                    <input
                      type="text"
                      value={blocker}
                      onChange={(e) => handleTaskChange('blockers', idx, e.target.value)}
                      placeholder="Enter blocker or issue"
                    />
                    {idx > 0 && (
                      <button type="button" onClick={() => removeTaskField('blockers', idx)} className="remove-btn">
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addTaskField('blockers')} className="add-task-btn">
                  + Add Blocker
                </button>
              </div>

              <div className="form-group">
                <label>Hours Worked (Optional)</label>
                <input
                  type="number"
                  value={formData.hoursWorked}
                  onChange={(e) => setFormData({...formData, hoursWorked: parseFloat(e.target.value)})}
                  min="0"
                  max="24"
                  step="0.5"
                  placeholder="8"
                />
              </div>

              <div className="form-group">
                <label>Additional Notes (Optional)</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Any additional information..."
                  rows="4"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="modal-overlay" onClick={cancelSubmitReport}>
          <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm EOD Report Submission</h2>
            </div>
            <div className="modal-body">
              <div className="confirmation-message">
                <div className="warning-icon">⚠️</div>
                <p><strong>Are you sure you want to submit your EOD report?</strong></p>
                <p>Once submitted, you cannot edit or delete this report.</p>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={cancelSubmitReport}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={confirmSubmitReport}>
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EODReports;