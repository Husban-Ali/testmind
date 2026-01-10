import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiVideo, FiPhone, FiUsers, FiSend, FiSmile, FiPaperclip, FiX } from 'react-icons/fi';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { getSocket } from '../../services/socket';
import Message from './Message.jsx';
import FileUploadModal from './FileUploadModal.jsx';
import './ChatArea.css';

function ChatArea() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentChannel, messages, sendMessage, typingUsers, addMessage, onlineUsers } = useChatStore();
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Also scroll to bottom when component mounts or channel changes
  useEffect(() => {
    scrollToBottom();
  }, [currentChannel]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }
  }, [messageInput]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Join channel room when currentChannel changes
  useEffect(() => {
    if (currentChannel) {
      const socket = getSocket();
      if (socket && socket.connected) {
        console.log('Joining channel room:', currentChannel._id);
        socket.emit('channel:join', currentChannel._id);
        
        // Cleanup: leave channel when component unmounts or channel changes
        return () => {
          console.log('Leaving channel room:', currentChannel._id);
          socket.emit('channel:leave', currentChannel._id);
        };
      }
    }
  }, [currentChannel]);

  useEffect(() => {
    if (channelId && currentChannel?._id !== channelId) {
      // Fetch channel data if needed
    }
  }, [channelId, currentChannel]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentChannel || sending) return;

    const messageText = messageInput.trim();
    setMessageInput(''); // Clear input immediately
    setSending(true);
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    
    try {
      await sendMessage(currentChannel._id, messageText, 'text', [], replyingTo?._id);
      setReplyingTo(null); // Clear reply after sending
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleEmojiSelect = (emoji) => {
    const textarea = inputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = messageInput;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + emoji.native + after;
    
    setMessageInput(newText);
    setShowEmojiPicker(false);
    
    // Set cursor position after emoji
    setTimeout(() => {
      const newCursorPos = start + emoji.native.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (socket && currentChannel) {
      socket.emit('typing:start', { channelId: currentChannel._id });
    }
  };

  const handleStopTyping = () => {
    const socket = getSocket();
    if (socket && currentChannel) {
      socket.emit('typing:stop', { channelId: currentChannel._id });
    }
  };

  const startCall = (callType) => {
    const socket = getSocket();
    console.log('Starting call - Socket connected:', socket?.connected);
    console.log('Current channel:', currentChannel);
    console.log('Call type:', callType);
    
    if (!socket) {
      alert('Socket not connected. Please refresh the page.');
      return;
    }
    
    if (!socket.connected) {
      alert('Socket disconnected. Please refresh the page.');
      return;
    }
    
    if (currentChannel) {
      console.log('Emitting call:initiate and navigating...');
      socket.emit('call:initiate', {
        channelId: currentChannel._id,
        callType
      });
      
      // Navigate to call page
      const callPath = `/dashboard/call/${currentChannel._id}?type=${callType}`;
      console.log('Navigating to:', callPath);
      navigate(callPath);
    } else {
      alert('No channel selected');
    }
  };

  if (!currentChannel) {
    return (
      <div className="chat-area-empty">
        <div className="empty-state">
          <h2>Welcome to Optima RS</h2>
          <p>Select a channel from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  const typingUser = typingUsers[currentChannel._id];
  
  // Get current user ID consistently
  const currentUserId = String(user?._id || user?.id || '');
  
  // Get channel display name and other member for direct messages
  let channelDisplayName = currentChannel.name;
  let otherMember = null;
  
  if (currentChannel.type === 'direct') {
    // Find the other member in DM
    otherMember = currentChannel.members?.find(m => {
      const memberId = String(m._id || m.id || '');
      return memberId !== currentUserId && memberId !== '';
    });
    
    if (otherMember) {
      channelDisplayName = `${otherMember.firstName || ''} ${otherMember.lastName || ''}`.trim() || otherMember.username || 'Unknown User';
    }
  }

  // Check if other member is online (for direct messages)
  const isOtherMemberOnline = otherMember ? onlineUsers.includes(String(otherMember._id || otherMember.id)) : false;

  return (
    <div className="chat-area">
      <div className="chat-header">
        <div className="channel-info">
          <h2>
            {currentChannel.type === 'direct' ? (
              <>
                {channelDisplayName}
              </>
            ) : (
              `# ${channelDisplayName}`
            )}
          </h2>
          {currentChannel.type === 'direct' ? (
            <p>
              {isOtherMemberOnline ? (
                <span style={{ color: '#2eb67d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: '#2eb67d',
                    display: 'inline-block'
                  }}></span>
                  Online
                </span>
              ) : (
                <span style={{ color: 'var(--text-secondary)' }}>Offline</span>
              )}
            </p>
          ) : (
            currentChannel.description && <p>{currentChannel.description}</p>
          )}
        </div>
        <div className="chat-actions">
          <button
            className="action-btn"
            onClick={() => startCall('audio')}
            title="Start voice call"
          >
            <FiPhone />
          </button>
          <button
            className="action-btn"
            onClick={() => startCall('video')}
            title="Start video call"
          >
            <FiVideo />
          </button>
          {currentChannel.type !== 'direct' && (
            <button className="action-btn" title="Channel members">
              <FiUsers />
              <span>{currentChannel.members?.length || 0}</span>
            </button>
          )}
        </div>
      </div>

      <div className="messages-container scrollbar-thin">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <Message
                key={message._id}
                message={message}
                isOwn={message.sender?._id === user?.id}
                showAvatar={
                  index === 0 ||
                  messages[index - 1]?.sender?._id !== message.sender?._id
                }
                onReply={handleReply}
              />
            ))}
            {typingUser && (
              <div className="typing-indicator">
                <span>{typingUser.username} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="message-input-container">
        {replyingTo && (
          <div className="reply-preview-container">
            <div className="reply-preview-content">
              <div className="reply-preview-header">
                <span className="reply-preview-label">Replying to {replyingTo.sender?.firstName} {replyingTo.sender?.lastName}</span>
                <button 
                  className="reply-cancel-btn"
                  onClick={cancelReply}
                  type="button"
                >
                  <FiX />
                </button>
              </div>
              <div className="reply-preview-text">
                {replyingTo.content || 'Attachment'}
              </div>
            </div>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="message-form">
          <button
            type="button"
            className="emoji-btn"
            onClick={() => setShowFileUpload(true)}
            title="Attach file"
          >
            <FiPaperclip />
          </button>
          <div className="emoji-picker-container" ref={emojiPickerRef}>
            <button
              type="button"
              className="emoji-btn"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Add emoji"
            >
              <FiSmile />
            </button>
            {showEmojiPicker && (
              <div className="emoji-picker-wrapper">
                <Picker 
                  data={data} 
                  onEmojiSelect={handleEmojiSelect}
                  theme="light"
                  previewPosition="none"
                  skinTonePosition="none"
                />
              </div>
            )}
          </div>
          <textarea
            ref={inputRef}
            placeholder={`Message ${currentChannel.type === 'direct' ? channelDisplayName : '#' + currentChannel.name}`}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onKeyPress={handleTyping}
            onBlur={handleStopTyping}
            disabled={sending}
            rows={1}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!messageInput.trim() || sending}
          >
            {sending ? '...' : <FiSend />}
          </button>
        </form>
      </div>

      {showFileUpload && (
        <FileUploadModal
          channelId={currentChannel._id}
          onClose={() => setShowFileUpload(false)}
          onFileUploaded={(message) => {
            addMessage(message);
            setShowFileUpload(false);
          }}
        />
      )}
    </div>
  );
}

export default ChatArea;
