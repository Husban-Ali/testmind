import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import Sidebar from '../components/Sidebar/Sidebar.jsx';
import ChatArea from '../components/Chat/ChatArea.jsx';
import AdminPanel from './AdminPanel.jsx';
import ProjectManagement from '../components/Projects/ProjectManagement.jsx';
import EODReports from '../components/EOD/EODReports.jsx';
import VideoCall from '../components/VideoCall/VideoCall.jsx';
import PushNotifications from '../components/PushNotifications/PushNotifications.jsx';
import LeaveRequest from '../components/Leaves/LeaveRequest.jsx';
import LeaveManagement from '../components/Leaves/LeaveManagement.jsx';
import MyProfile from '../components/Profile/MyProfile.jsx';
import UserDetailView from '../components/Profile/UserDetailView.jsx';
import EmployeeProfileEditor from '../components/Profile/EmployeeProfileEditor.jsx';
import AttendanceDashboard from '../components/Attendance/AttendanceDashboard.jsx';
import { useChatStore } from '../store/chatStore';
import { getSocket } from '../services/socket';
import { useAuthStore } from '../store/authStore';
import './Dashboard.css';

function Dashboard() {
  const { fetchChannels, addMessage, updateMessage, deleteMessage, setOnlineUsers, updateUserStatus, removeChannel } = useChatStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchChannels();

    const socket = getSocket();
    if (socket) {
      // Listen for new messages
      socket.on('message:new', (message) => {
        console.log('New message received via socket:', message);
        addMessage(message);
        // Refresh channels to update unread counts
        fetchChannels();
      });

      // Listen for message updates
      socket.on('message:updated', (message) => {
        updateMessage(message);
      });

      // Listen for message deletions
      socket.on('message:deleted', ({ messageId }) => {
        deleteMessage(messageId);
      });

      // Listen for online users
      socket.on('users:online', (users) => {
        setOnlineUsers(users);
      });

      // Listen for user status changes
      socket.on('user:status', ({ userId, status }) => {
        updateUserStatus(userId, status);
      });

      // Listen for new channels (including DMs)
      socket.on('channel:created', (channel) => {
        console.log('New channel created:', channel);
        fetchChannels(); // Refresh channels list
      });

      // Listen for channel deletion
      socket.on('channel:deleted', ({ channelId }) => {
        console.log('Channel deleted:', channelId);
        removeChannel(channelId); // Remove from state immediately
        // Navigate away if we were viewing the deleted channel
        if (window.location.pathname.includes(channelId)) {
          navigate('/dashboard');
        }
      });

      // Listen for incoming calls
      socket.on('call:incoming', ({ channelId, callerId, callerName, callType }) => {
        console.log('Incoming call from:', callerName, 'Type:', callType);
        setIncomingCall({ channelId, callerId, callerName, callType });
      });

      return () => {
        socket.off('message:new');
        socket.off('message:updated');
        socket.off('message:deleted');
        socket.off('users:online');
        socket.off('user:status');
        socket.off('channel:created');
        socket.off('channel:deleted');
        socket.off('call:incoming');
      };
    }
  }, [fetchChannels, addMessage, updateMessage, deleteMessage, setOnlineUsers, updateUserStatus, removeChannel, navigate]);

  const handleAcceptCall = () => {
    if (incomingCall) {
      navigate(`/dashboard/call/${incomingCall.channelId}?type=${incomingCall.callType}`);
      setIncomingCall(null);
    }
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      const socket = getSocket();
      socket?.emit('call:reject', { channelId: incomingCall.channelId });
      setIncomingCall(null);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Mobile Menu Toggle */}
      <div className="mobile-menu-toggle">
        <button 
          className="menu-toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar with overlay */}
      <div className={`sidebar-wrapper ${sidebarOpen ? 'active' : ''}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="sidebar-overlay" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>

      <div className="dashboard-main">
        <Routes>
          <Route path="/" element={<ChatArea />} />
          <Route path="/channel/:channelId" element={<ChatArea />} />
          {(['ceo', 'co_ceo', 'company_manager'].includes(user?.role)) && (
            <Route path="/admin" element={<AdminPanel />} />
          )}
          {(['ceo', 'co_ceo', 'company_manager', 'sales_head', 'production_head', 'manager'].includes(user?.role)) && (
            <Route path="/projects" element={<ProjectManagement />} />
          )}
          {(['ceo', 'co_ceo', 'company_manager', 'manager', 'sales_head', 'production_head'].includes(user?.role)) && (
            <Route path="/attendance" element={<AttendanceDashboard />} />
          )}
          <Route path="/eod" element={<EODReports />} />
          <Route path="/leaves" element={
            ['ceo', 'co_ceo', 'company_manager', 'sales_head', 'production_head', 'manager'].includes(user?.role) 
              ? <LeaveManagement /> 
              : <LeaveRequest />
          } />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/user-detail/:userId" element={<UserDetailView />} />
          {(['ceo', 'co_ceo', 'company_manager'].includes(user?.role)) && (
            <Route path="/edit-profile/:userId" element={<EmployeeProfileEditor />} />
          )}
          <Route path="/call/:channelId" element={<VideoCall />} />
        </Routes>
      </div>
      
      {/* Push Notifications Component */}
      <PushNotifications />
      
      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="incoming-call-modal">
          <div className="incoming-call-content">
            <div className="incoming-call-header">
              <h3>Incoming {incomingCall.callType === 'audio' ? 'Voice' : 'Video'} Call</h3>
            </div>
            <div className="incoming-call-body">
              <p className="caller-name">{incomingCall.callerName}</p>
              <p className="call-type">is calling you...</p>
            </div>
            <div className="incoming-call-actions">
              <button className="reject-btn" onClick={handleRejectCall}>
                Decline
              </button>
              <button className="accept-btn" onClick={handleAcceptCall}>
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
