import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { FiClock, FiCheck, FiX, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import './AttendanceTracker.css';

const AttendanceTracker = () => {
  const { user } = useAuthStore();
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceStatus();
    // Refresh every 5 minutes
    const interval = setInterval(fetchAttendanceStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAttendanceStatus = async () => {
    try {
      const response = await api.get('/attendance/my-status');
      setAttendanceStatus(response.data.attendance);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!attendanceStatus) {
      return {
        text: 'Absent',
        subtext: 'Unpaid Leave',
        color: '#e74c3c',
        icon: <FiX />,
        bgColor: 'rgba(231, 76, 60, 0.1)'
      };
    }

    switch (attendanceStatus.status) {
      case 'present':
        return {
          text: 'Present',
          subtext: attendanceStatus.checkInTime 
            ? `Checked in at ${new Date(attendanceStatus.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
            : 'Marked present',
          color: '#27ae60',
          icon: <FiCheck />,
          bgColor: 'rgba(39, 174, 96, 0.1)'
        };
      
      case 'on_leave':
        const isPaid = attendanceStatus.leaveType === 'paid';
        return {
          text: 'On Leave',
          subtext: isPaid ? 'Paid Leave' : 'Unpaid Leave',
          color: isPaid ? '#f39c12' : '#e67e22',
          icon: <FiCalendar />,
          bgColor: isPaid ? 'rgba(243, 156, 18, 0.1)' : 'rgba(230, 126, 34, 0.1)'
        };
      
      case 'absent':
      default:
        return {
          text: 'Absent',
          subtext: 'Unpaid Leave',
          color: '#e74c3c',
          icon: <FiX />,
          bgColor: 'rgba(231, 76, 60, 0.1)'
        };
    };
  };
  
  if (loading) {
    return (
      <div className="attendance-tracker loading">
        <div className="spinner"></div>
      </div>
    );
  }
  
  const statusDisplay = getStatusDisplay();
  
  return (
    <div className="attendance-tracker">
      <div className="attendance-header">
        <FiClock />
        <span>Today's Status</span>
      </div>

      <div 
        className="attendance-status-card" 
        style={{ 
          backgroundColor: statusDisplay.bgColor,
          borderLeft: `4px solid ${statusDisplay.color}`
        }}
      >
        <div className="status-icon" style={{ color: statusDisplay.color }}>
          {statusDisplay.icon}
        </div>
        <div className="status-info">
          <div className="status-text" style={{ color: statusDisplay.color }}>
            {statusDisplay.text}
          </div>
          <div className="status-subtext">{statusDisplay.subtext}</div>
        </div>
      </div>

      {/* Info message - Check-in/out is managed by management */}
      {attendanceStatus?.status !== 'on_leave' && (
        <div className="attendance-info-message">
          <FiAlertCircle />
          <span>Attendance is managed by your supervisor</span>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracker;
