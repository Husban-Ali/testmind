import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHash, FiLock, FiPlus, FiLogOut, FiSettings, FiUsers, FiFileText, FiMessageSquare, FiTrash2, FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { disconnectSocket } from '../../services/socket';
import api from '../../services/api';
import { toast } from 'react-toastify';
import CreateChannelModal from './CreateChannelModal.jsx';
import DirectMessageModal from './DirectMessageModal.jsx';
import './Sidebar.css';

function Sidebar({ onClose }) {
  const { user, logout, loadUser } = useAuthStore();
  const { channels, currentChannel, setCurrentChannel } = useChatStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDMModal, setShowDMModal] = useState(false);
  const navigate = useNavigate();

  // Refresh user data when sidebar mounts to get latest profile picture
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/login');
  };

  const handleChannelClick = (channel) => {
    setCurrentChannel(channel);
    navigate(`/dashboard/channel/${channel._id}`);
    // Close sidebar on mobile after selecting a channel
    if (onClose) onClose();
  };

  const handleDeleteChannel = async (e, channelId, channelName) => {
    e.stopPropagation();
    
    if (!window.confirm(`Are you sure you want to delete channel "${channelName}"?`)) {
      return;
    }

    try {
      await api.delete(`/channels/${channelId}`);
      toast.success('Channel deleted successfully');
      
      // If we were on this channel, navigate away
      if (currentChannel?._id === channelId) {
        navigate('/dashboard');
        setCurrentChannel(null);
      }
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast.error(error.response?.data?.message || 'Failed to delete channel');
    }
  };

  const publicChannels = channels.filter(c => c.type === 'public');
  const privateChannels = channels.filter(c => c.type === 'private');
  const projectChannels = channels.filter(c => c.type === 'project');
  const directMessages = channels.filter(c => c.type === 'direct');
  const eodChannel = channels.find(c => c.type === 'eod');

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Optima RS</h2>
        <div className="user-info" onClick={() => navigate('/dashboard/profile')} style={{ cursor: 'pointer' }} title="View Profile">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" className="user-avatar user-avatar-img" />
          ) : (
            <div className="user-avatar">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          )}
          <div className="user-details">
            <div className="user-name">{user?.firstName} {user?.lastName}</div>
            <div className="user-role">{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>
      </div>

      <div className="sidebar-nav">
        {(['ceo', 'co_ceo', 'company_manager'].includes(user?.role)) && (
          <button 
            className="nav-item"
            onClick={() => navigate('/dashboard/admin')}
          >
            <FiSettings /> Admin Panel
          </button>
        )}
        
        {(['ceo', 'co_ceo', 'company_manager', 'sales_head', 'production_head', 'manager'].includes(user?.role)) && (
          <button 
            className="nav-item"
            onClick={() => navigate('/dashboard/projects')}
          >
            <FiUsers /> Projects
          </button>
        )}

        {(['ceo', 'co_ceo', 'company_manager', 'manager', 'sales_head', 'production_head'].includes(user?.role)) && (
          <button 
            className="nav-item"
            onClick={() => navigate('/dashboard/attendance')}
          >
            <FiClock /> Attendance
          </button>
        )}

        <button 
          className="nav-item"
          onClick={() => navigate('/dashboard/eod')}
        >
          <FiFileText /> EOD Reports
        </button>

        <button 
          className="nav-item"
          onClick={() => navigate('/dashboard/leaves')}
        >
          <FiCalendar /> Leave Request
        </button>

        <button 
          className="nav-item"
          onClick={() => setShowDMModal(true)}
        >
          <FiMessageSquare /> New Direct Message
        </button>
      </div>

      <div className="sidebar-channels scrollbar-thin">
        {eodChannel && (
          <div className="channel-section">
            <div className="section-header">
              <FiFileText />
              <span>EOD Reports</span>
            </div>
            <div
              className={`channel-item ${currentChannel?._id === eodChannel._id ? 'active' : ''}`}
              onClick={() => handleChannelClick(eodChannel)}
            >
              <FiHash />
              <span>{eodChannel.name}</span>
            </div>
          </div>
        )}

        <div className="channel-section">
          <div className="section-header">
            <FiHash />
            <span>Channels</span>
            {(user?.role !== 'employee') && (
              <button 
                className="add-channel-btn"
                onClick={() => setShowCreateModal(true)}
                title="Create channel"
              >
                <FiPlus />
              </button>
            )}
          </div>
          {publicChannels.map(channel => {
            const unreadCount = channel.userUnreadCount || 0;
            return (
              <div
                key={channel._id}
                className={`channel-item ${currentChannel?._id === channel._id ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => handleChannelClick(channel)}
              >
                <FiHash />
                <span>{channel.name}</span>
                {unreadCount > 0 && (
                  <span className="unread-badge">{unreadCount}</span>
                )}
                {(user?.role === 'ceo' || user?.role === 'co_ceo') && (
                  <button
                    className="delete-channel-btn"
                    onClick={(e) => handleDeleteChannel(e, channel._id, channel.name)}
                    title="Delete channel"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {privateChannels.length > 0 && (
          <div className="channel-section">
            <div className="section-header">
              <FiLock />
              <span>Private Channels</span>
            </div>
            {privateChannels.map(channel => {
              const unreadCount = channel.userUnreadCount || 0;
              return (
                <div
                  key={channel._id}
                  className={`channel-item ${currentChannel?._id === channel._id ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
                  onClick={() => handleChannelClick(channel)}
                >
                  <FiLock />
                  <span>{channel.name}</span>
                  {unreadCount > 0 && (
                    <span className="unread-badge">{unreadCount}</span>
                  )}
                  {(user?.role === 'ceo' || user?.role === 'co_ceo') && (
                    <button
                      className="delete-channel-btn"
                      onClick={(e) => handleDeleteChannel(e, channel._id, channel.name)}
                      title="Delete channel"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {projectChannels.length > 0 && (
          <div className="channel-section">
            <div className="section-header">
              <FiUsers />
              <span>Project Channels</span>
            </div>
            {projectChannels.map(channel => {
              const unreadCount = channel.userUnreadCount || 0;
              return (
                <div
                  key={channel._id}
                  className={`channel-item ${currentChannel?._id === channel._id ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
                  onClick={() => handleChannelClick(channel)}
                >
                  <FiUsers />
                  <span>{channel.name}</span>
                  {unreadCount > 0 && (
                    <span className="unread-badge">{unreadCount}</span>
                  )}
                  {(user?.role === 'ceo' || user?.role === 'co_ceo') && (
                    <button
                      className="delete-channel-btn"
                      onClick={(e) => handleDeleteChannel(e, channel._id, channel.name)}
                      title="Delete channel"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {directMessages.length > 0 && (
          <div className="channel-section">
            <div className="section-header">
              <FiMessageSquare />
              <span>Direct Messages</span>
            </div>
            {directMessages.map(channel => {
              // Get current user ID consistently as string
              const currentUserId = String(user?._id || user?.id || '');
              
              // Find the OTHER member (not the current user)
              const otherMember = channel.members?.find(m => {
                const memberId = String(m._id || m.id || '');
                return memberId !== currentUserId && memberId !== '';
              });
              
              const dmName = otherMember 
                ? `${otherMember.firstName || ''} ${otherMember.lastName || ''}`.trim() || otherMember.username || 'Unknown User'
                : 'Unknown User';
              
              const unreadCount = channel.userUnreadCount || 0;
              const lastMsg = channel.lastMessage;
              
              console.log('DM Channel:', {
                channelId: channel._id,
                currentUserId,
                members: channel.members?.map(m => ({ id: m._id || m.id, name: `${m.firstName} ${m.lastName}` })),
                otherMember: otherMember ? { id: otherMember._id || otherMember.id, name: `${otherMember.firstName} ${otherMember.lastName}` } : null,
                dmName
              });
              
              return (
                <div
                  key={channel._id}
                  className={`channel-item dm-item ${currentChannel?._id === channel._id ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
                  onClick={() => handleChannelClick(channel)}
                >
                  <div className="dm-avatar-container">
                    {otherMember?.profilePicture ? (
                      <img src={otherMember.profilePicture} alt="Profile" className="dm-avatar dm-avatar-img" />
                    ) : (
                      <div className="dm-avatar">
                        {otherMember?.firstName?.[0]}{otherMember?.lastName?.[0]}
                      </div>
                    )}
                    {otherMember?.status === 'online' && (
                      <span className="online-indicator"></span>
                    )}
                  </div>
                  <div className="dm-info">
                    <div className="dm-header">
                      <span className="dm-name">{dmName}</span>
                      {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount}</span>
                      )}
                    </div>
                    {lastMsg && (
                      <p className="dm-last-message">
                        {lastMsg.content?.substring(0, 30)}{lastMsg.content?.length > 30 ? '...' : ''}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>

      {showCreateModal && (
        <CreateChannelModal onClose={() => setShowCreateModal(false)} />
      )}

      {showDMModal && (
        <DirectMessageModal onClose={() => setShowDMModal(false)} />
      )}
    </div>
  );
}

export default Sidebar;
