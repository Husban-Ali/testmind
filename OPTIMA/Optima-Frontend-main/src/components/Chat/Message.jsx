import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../../store/authStore';
import { FiFile, FiDownload, FiMusic, FiCornerUpLeft } from 'react-icons/fi';
import './Message.css';

function Message({ message, isOwn, showAvatar, onReply }) {
  const { user } = useAuthStore();
  const [showActions, setShowActions] = useState(false);
  
  // Get IDs and convert to strings for reliable comparison
  const senderId = String(message.sender?._id || message.sender?.id || '');
  const currentUserId = String(user?._id || user?.id || '');
  const isMyMessage = senderId === currentUserId && senderId !== '';
  
  const formatTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const renderAttachment = (attachment) => {
    const { url, filename, fileType } = attachment;

    if (fileType?.startsWith('image/')) {
      return (
        <div className="image-message-wrapper">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <img 
              src={url} 
              alt={filename || "Image attachment"} 
              className="message-image" 
              loading="lazy" 
              onError={(e) => {
                e.target.alt = "Failed to load image";
              }}
            />
          </a>
        </div>
      );
    }

    if (fileType?.startsWith('audio/')) {
      return (
        <div className="audio-message">
          <FiMusic />
          <audio controls src={url} className="audio-player" />
        </div>
      );
    }

    if (fileType?.startsWith('video/')) {
      return (
        <video controls src={url} className="message-video" />
      );
    }

    // For other files (PDF, ZIP, etc.)
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="file-attachment">
        <div className="file-icon">
          <FiFile />
        </div>
        <div className="file-info">
          <div className="file-name">{filename}</div>
          <FiDownload className="download-icon" />
        </div>
      </a>
    );
  };

  return (
    <div 
      className={`message ${isMyMessage ? 'own-message' : 'other-message'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isMyMessage && showAvatar && (
        message.sender?.profilePicture ? (
          <img src={message.sender.profilePicture} alt="Profile" className="message-avatar message-avatar-img" />
        ) : (
          <div className="message-avatar">
            {message.sender?.firstName?.[0]}{message.sender?.lastName?.[0]}
          </div>
        )
      )}
      {!isMyMessage && !showAvatar && <div className="message-avatar-spacer" />}
      
      <div className="message-content">
        {!isMyMessage && showAvatar && (
          <div className="message-header">
            <span className="message-sender">
              {message.sender?.firstName} {message.sender?.lastName}
            </span>
            <span className="message-time">{formatTime(message.createdAt)}</span>
          </div>
        )}
        <div className="message-bubble">
          {message.replyTo && (
            <div className="message-reply-preview">
              <div className="reply-border"></div>
              <div className="reply-content">
                <div className="reply-sender">
                  {message.replyTo.sender?.firstName} {message.replyTo.sender?.lastName}
                </div>
                <div className="reply-text">
                  {message.replyTo.content || 'Attachment'}
                </div>
              </div>
            </div>
          )}
          {message.attachments && message.attachments.length > 0 && (
            <div className="message-attachments">
              {message.attachments.map((attachment, idx) => (
                <div key={idx}>
                  {renderAttachment(attachment)}
                </div>
              ))}
            </div>
          )}
          {message.content && (
            <div className="message-text">
              {message.content}
            </div>
          )}
        </div>
        {(isOwn || message.editedAt) && (
          <div className={isOwn ? "message-time-own" : "message-time"}>
            {formatTime(message.createdAt)}
            {message.editedAt && <span className="edited-tag">(edited)</span>}
          </div>
        )}
      </div>
      
      {showActions && (
        <button 
          className="message-reply-btn"
          onClick={() => onReply(message)}
          title="Reply to message"
        >
          <FiCornerUpLeft />
        </button>
      )}
    </div>
  );
}

export default Message;
