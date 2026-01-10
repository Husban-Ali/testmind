import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiSearch } from 'react-icons/fi';
import api from '../../services/api';
import { useChatStore } from '../../store/chatStore';
import { toast } from 'react-toastify';
import './CreateChannelModal.css';

function DirectMessageModal({ onClose }) {
  const navigate = useNavigate();
  const { addChannel, setCurrentChannel } = useChatStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/available-for-dm');
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDM = async (userId) => {
    if (creating) return;
    
    setCreating(true);
    try {
      const response = await api.post('/channels/direct', { userId });
      const channel = response.data.channel;
      
      addChannel(channel);
      setCurrentChannel(channel);
      navigate(`/dashboard/channel/${channel._id}`);
      toast.success('Direct message started!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start direct message');
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(search) ||
      user.lastName?.toLowerCase().includes(search) ||
      user.username?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Start Direct Message</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          <div className="form-group">
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
              Loading users...
            </div>
          ) : (
            <div className="users-list" style={{ 
              maxHeight: '400px', 
              overflowY: 'auto',
              marginTop: '10px'
            }}>
              {filteredUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                  No users found
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div
                    key={user._id}
                    className="user-item"
                    onClick={() => handleStartDM(user._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      transition: 'background 0.2s',
                      marginBottom: '8px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="user-avatar-small" style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-color)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      position: 'relative'
                    }}>
                      {user.firstName?.[0]}{user.lastName?.[0]}
                      {user.status === 'online' && (
                        <span style={{
                          position: 'absolute',
                          bottom: '0',
                          right: '0',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: '#2eb67d',
                          border: '2px solid white'
                        }}></span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        @{user.username}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: user.status === 'online' ? '#2eb67d' : 'var(--text-secondary)',
                      textTransform: 'capitalize'
                    }}>
                      {user.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DirectMessageModal;
