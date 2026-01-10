import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import api from '../../services/api';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import './CreateChannelModal.css';

function CreateChannelModal({ onClose }) {
  const { addChannel } = useChatStore();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'public',
    members: []
  });
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch all users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await api.get('/users');
        // Filter out current user
        const filteredUsers = response.data.users.filter(u => u._id !== user?._id);
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [user]);

  const handleMemberToggle = (userId) => {
    setFormData(prev => {
      const isSelected = prev.members.includes(userId);
      return {
        ...prev,
        members: isSelected 
          ? prev.members.filter(id => id !== userId)
          : [...prev.members, userId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For private channels, ensure members array includes the creator
      const channelData = {
        ...formData,
        members: formData.type === 'private' && formData.members.length > 0
          ? [...formData.members, user._id]
          : formData.members.length > 0 
            ? formData.members 
            : [user._id]
      };
      
      const response = await api.post('/channels', channelData);
      addChannel(response.data.channel);
      toast.success('Channel created successfully!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create channel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Channel</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Channel Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. general"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="What's this channel about?"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Channel Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value, members: []})}
            >
              <option value="public">Public - Anyone can join</option>
              <option value="private">Private - Invite only</option>
            </select>
          </div>

          {formData.type === 'private' && (
            <div className="form-group">
              <label>Add Members (Private Channel)</label>
              <div className="members-selection">
                {loadingUsers ? (
                  <p>Loading users...</p>
                ) : users.length === 0 ? (
                  <p>No users available</p>
                ) : (
                  <div className="user-list">
                    {users.map(u => (
                      <label key={u._id} className="user-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.members.includes(u._id)}
                          onChange={() => handleMemberToggle(u._id)}
                        />
                        <span>{u.firstName} {u.lastName} ({u.role})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <small>Selected: {formData.members.length} member(s)</small>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateChannelModal;
