import React, { useState, useRef } from 'react';
import { FiX, FiUpload, FiFile, FiImage, FiMusic, FiVideo } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './FileUploadModal.css';

function FileUploadModal({ onClose, channelId, onFileUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('channel', channelId);
      if (caption) {
        formData.append('caption', caption);
      }

      const response = await api.post('/messages/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('File uploaded successfully!');
      if (onFileUploaded) {
        onFileUploaded(response.data.message);
      }
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return <FiFile />;
    
    const type = selectedFile.type;
    if (type.startsWith('image/')) return <FiImage />;
    if (type.startsWith('audio/')) return <FiMusic />;
    if (type.startsWith('video/')) return <FiVideo />;
    return <FiFile />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload File</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="file-upload-body">
          {!selectedFile ? (
            <div 
              className="file-dropzone" 
              onClick={() => fileInputRef.current?.click()}
            >
              <FiUpload size={48} />
              <p>Click to select a file</p>
              <span className="file-types">
                Images, PDFs, Documents, Audio, Video, ZIP (Max 100MB)
              </span>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.zip,.rar"
              />
            </div>
          ) : (
            <div className="file-preview">
              {preview ? (
                <img src={preview} alt="Preview" className="image-preview" />
              ) : (
                <div className="file-icon-preview">
                  {getFileIcon()}
                  <div className="file-details">
                    <div className="file-name">{selectedFile.name}</div>
                    <div className="file-size">{formatFileSize(selectedFile.size)}</div>
                  </div>
                </div>
              )}
              
              <button 
                className="change-file-btn"
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
              >
                Change File
              </button>
            </div>
          )}

          {selectedFile && (
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label>Caption (Optional)</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption..."
                disabled={uploading}
              />
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="modal-actions">
            <button 
              className="btn-secondary" 
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </button>
            <button 
              className="btn-primary" 
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Send File'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUploadModal;
