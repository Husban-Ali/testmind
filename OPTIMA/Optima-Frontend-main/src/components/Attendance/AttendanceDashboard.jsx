import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { FiCheck, FiX, FiCalendar, FiClock, FiUsers, FiRefreshCw, FiLogIn, FiLogOut } from 'react-icons/fi';
import './AttendanceDashboard.css';

const AttendanceDashboard = () => {
  const { user } = useAuthStore();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [summary, setSummary] = useState({
    present: 0,
    absent: 0,
    onLeave: 0,
    total: 0
  });

  useEffect(() => {
    fetchAttendanceData();
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchAttendanceData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const response = await api.get('/attendance/all-status');
      const data = response.data.attendanceStatus;
      setAttendanceData(data);

      // Calculate summary
      const summary = {
        present: data.filter(d => d.status === 'present').length,
        absent: data.filter(d => d.status === 'absent').length,
        onLeave: data.filter(d => d.status === 'on_leave').length,
        total: data.length
      };
      setSummary(summary);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyAttendance = async (userId) => {
    setLoadingMonthly(true);
    try {
      // Get current month's data
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const response = await api.get(`/attendance/history?userId=${userId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=100`);
      setMonthlyData(response.data);
    } catch (error) {
      console.error('Failed to fetch monthly attendance:', error);
    } finally {
      setLoadingMonthly(false);
    }
  };

  const handleViewMonthly = (employee) => {
    setSelectedEmployee(employee);
    setShowMonthlyModal(true);
    fetchMonthlyAttendance(employee._id);
  };

  const handleCheckIn = async (userId) => {
    try {
      await api.post('/attendance/check-in', { userId });
      fetchAttendanceData();
    } catch (error) {
      console.error('Check-in failed:', error);
      alert(error.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async (userId) => {
    try {
      await api.post('/attendance/check-out', { userId });
      fetchAttendanceData();
    } catch (error) {
      console.error('Check-out failed:', error);
      alert(error.response?.data?.message || 'Failed to check out');
    }
  };

  const getStatusBadge = (status, leaveType) => {
    switch (status) {
      case 'present':
        return <span className="badge badge-present"><FiCheck /> Present</span>;
      case 'on_leave':
        if (leaveType === 'paid') {
          return <span className="badge badge-leave-paid"><FiCalendar /> On Leave (Paid)</span>;
        }
        return <span className="badge badge-leave-unpaid"><FiCalendar /> On Leave (Unpaid)</span>;
      case 'absent':
      default:
        return <span className="badge badge-absent"><FiX /> Absent (Unpaid)</span>;
    }
  };

  const formatTime = (time) => {
    if (!time) return '-';
    return new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="attendance-dashboard">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-dashboard">
      <div className="dashboard-header">
        <div className="header-title">
          <h1><FiUsers /> Employee Attendance</h1>
          <p>Today's attendance overview - {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
        <button className="refresh-btn" onClick={fetchAttendanceData}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card total">
          <div className="summary-icon"><FiUsers /></div>
          <div className="summary-info">
            <div className="summary-value">{summary.total}</div>
            <div className="summary-label">Total Employees</div>
          </div>
        </div>

        <div className="summary-card present">
          <div className="summary-icon"><FiCheck /></div>
          <div className="summary-info">
            <div className="summary-value">{summary.present}</div>
            <div className="summary-label">Present</div>
          </div>
        </div>

        <div className="summary-card on-leave">
          <div className="summary-icon"><FiCalendar /></div>
          <div className="summary-info">
            <div className="summary-value">{summary.onLeave}</div>
            <div className="summary-label">On Leave</div>
          </div>
        </div>

        <div className="summary-card absent">
          <div className="summary-icon"><FiX /></div>
          <div className="summary-info">
            <div className="summary-value">{summary.absent}</div>
            <div className="summary-label">Absent</div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Status</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Hours</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((record) => (
              <tr key={record.user._id}>
                <td>
                  <div className="employee-cell">
                    {record.user.profilePicture ? (
                      <img src={record.user.profilePicture} alt="Profile" className="employee-avatar" />
                    ) : (
                      <div className="employee-avatar">
                        {record.user.firstName?.[0]}{record.user.lastName?.[0]}
                      </div>
                    )}
                    <div className="employee-info">
                      <div className="employee-name">
                        {record.user.firstName} {record.user.lastName}
                      </div>
                      <div className="employee-role">{record.user.role?.replace('_', ' ')}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="dept-badge">{record.user.department?.toUpperCase()}</span>
                </td>
                <td>
                  {getStatusBadge(record.status, record.leaveType)}
                </td>
                <td className="time-cell">{formatTime(record.checkInTime)}</td>
                <td className="time-cell">{formatTime(record.checkOutTime)}</td>
                <td className="hours-cell">
                  {record.workingHours > 0 ? (
                    <span className="hours-value">
                      <FiClock /> {record.workingHours.toFixed(1)}h
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    {record.status !== 'on_leave' && (
                      <>
                        <button
                          className="btn-action btn-check-in"
                          onClick={() => handleCheckIn(record.user._id)}
                          disabled={record.checkInTime}
                          title={record.checkInTime ? 'Already checked in' : 'Check In'}
                        >
                          <FiLogIn />
                        </button>
                        <button
                          className="btn-action btn-check-out"
                          onClick={() => handleCheckOut(record.user._id)}
                          disabled={!record.checkInTime || record.checkOutTime}
                          title={!record.checkInTime ? 'Check in first' : record.checkOutTime ? 'Already checked out' : 'Check Out'}
                        >
                          <FiLogOut />
                        </button>
                      </>
                    )}
                    <button
                      className="btn-action btn-view-monthly"
                      onClick={() => handleViewMonthly(record.user)}
                      title="View Monthly Attendance"
                    >
                      <FiCalendar />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {attendanceData.length === 0 && (
          <div className="empty-state">
            <p>No attendance data available</p>
          </div>
        )}
      </div>

      {/* Monthly Attendance Modal */}
      {showMonthlyModal && (
        <div className="modal-overlay" onClick={() => setShowMonthlyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FiCalendar /> Monthly Attendance - {selectedEmployee?.firstName} {selectedEmployee?.lastName}
              </h2>
              <button className="modal-close" onClick={() => setShowMonthlyModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              {loadingMonthly ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              ) : monthlyData && monthlyData.attendance ? (
                <>
                  <div className="monthly-summary">
                    <div className="monthly-stat">
                      <FiCheck style={{ color: '#27ae60' }} />
                      <span>Present: <strong>{monthlyData.attendance.filter(a => a.status === 'present').length}</strong></span>
                    </div>
                    <div className="monthly-stat">
                      <FiX style={{ color: '#e74c3c' }} />
                      <span>Absent: <strong>{monthlyData.attendance.filter(a => a.status === 'absent').length}</strong></span>
                    </div>
                    <div className="monthly-stat">
                      <FiCalendar style={{ color: '#f39c12' }} />
                      <span>On Leave: <strong>{monthlyData.attendance.filter(a => a.status === 'on_leave').length}</strong></span>
                    </div>
                    <div className="monthly-stat">
                      <FiClock style={{ color: '#3498db' }} />
                      <span>Total Hours: <strong>{monthlyData.attendance.reduce((sum, a) => sum + (a.workingHours || 0), 0).toFixed(1)}h</strong></span>
                    </div>
                  </div>

                  <div className="monthly-table-container">
                    <table className="monthly-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Check In</th>
                          <th>Check Out</th>
                          <th>Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyData.attendance.map((record) => (
                          <tr key={record._id}>
                            <td>{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                            <td>{getStatusBadge(record.status, record.leaveType)}</td>
                            <td className="time-cell">{formatTime(record.checkInTime)}</td>
                            <td className="time-cell">{formatTime(record.checkOutTime)}</td>
                            <td className="hours-cell">
                              {record.workingHours > 0 ? (
                                <span className="hours-value">
                                  <FiClock /> {record.workingHours.toFixed(1)}h
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <p>No attendance data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceDashboard;
