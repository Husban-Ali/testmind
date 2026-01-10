import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiCreditCard, FiCalendar, FiMapPin, FiBriefcase } from 'react-icons/fi';
import './MyProfile.css';

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cvFile, setCvFile] = useState(null);
  const [docsFiles, setDocsFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile/my-profile');
      setProfile(response.data.profile);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCvChange = (e) => {
    setCvFile(e.target.files[0]);
  };

  const handleDocsChange = (e) => {
    setDocsFiles(Array.from(e.target.files));
  };

  const uploadCv = async () => {
    if (!cvFile) return toast.error('Select a CV to upload');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('cv', cvFile);
      // Use management endpoint when uploading for a user
      const url = profile && profile._id
        ? `/profile/manage/${profile._id}/upload-cv`
        : '/profile/upload-cv';
      const res = await api.post(url, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('CV uploaded');
      fetchProfile();
      setCvFile(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload CV');
    } finally {
      setUploading(false);
    }
  };

  const uploadDocuments = async () => {
    if (!docsFiles || docsFiles.length === 0) return toast.error('Select documents to upload');
    setUploading(true);
    try {
      const fd = new FormData();
      docsFiles.forEach(f => fd.append('documents', f));
      const url = profile && profile._id
        ? `/profile/manage/${profile._id}/upload-documents`
        : '/profile/upload-documents';
      await api.post(url, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Documents uploaded');
      fetchProfile();
      setDocsFiles([]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (publicId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      // Management delete endpoint requires userId
      const userId = profile && profile._id;
      if (!userId) throw new Error('User id missing');
      await api.delete(`/profile/manage/${userId}/document/${publicId}`);
      toast.success('Document deleted');
      fetchProfile();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete document');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not provided';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="my-profile-container">
      <div className="profile-header">
        <h1>👤 My Profile</h1>
        <p>View your profile information (Read-Only)</p>
        <div className="info-notice">
          ℹ️ Your profile can only be updated by management (CEO/Co-CEO/Company Manager)
        </div>
      </div>

      {/* Profile Picture Section */}
      <div className="profile-card">
        <h2>Profile Picture</h2>
        <div className="profile-picture-section">
          <div className="profile-picture-preview">
            {profile?.profilePicture ? (
              <img src={profile.profilePicture} alt="Profile" />
            ) : (
              <div className="profile-avatar-large">
                {profile?.firstName?.[0]}{profile?.lastName?.[0]}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information - Read Only */}
      <div className="profile-card">
        <h2>Personal Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label"><FiUser /> Full Name</span>
            <span className="info-value">{profile?.firstName} {profile?.lastName}</span>
          </div>
          <div className="info-item">
            <span className="info-label"><FiUser /> Father Name</span>
            <span className="info-value">{profile?.fatherName || 'Not provided'}</span>
          </div>
          <div className="info-item">
            <span className="info-label"><FiCalendar /> Date of Birth</span>
            <span className="info-value">{formatDate(profile?.dateOfBirth)}</span>
          </div>
          <div className="info-item">
            <span className="info-label"><FiUser /> Gender</span>
            <span className="info-value">{profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'Not provided'}</span>
          </div>
          <div className="info-item">
            <span className="info-label"><FiMail /> Company Email</span>
            <span className="info-value">{profile?.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label"><FiMail /> Personal Email</span>
            <span className="info-value">{profile?.personalEmail || 'Not provided'}</span>
          </div>
          <div className="info-item">
            <span className="info-label"><FiPhone /> Phone Number</span>
            <span className="info-value">{profile?.phoneNumber || 'Not provided'}</span>
          </div>
          <div className="info-item">
            <span className="info-label"><FiCreditCard /> CNIC Number</span>
            <span className="info-value">{profile?.cnicNumber || 'Not provided'}</span>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="profile-card">
        <h2>Address Information</h2>
        <div className="info-grid">
          <div className="info-item full-width">
            <span className="info-label"><FiMapPin /> Current Address</span>
            <span className="info-value">{profile?.currentAddress || 'Not provided'}</span>
          </div>
          <div className="info-item full-width">
            <span className="info-label"><FiMapPin /> Permanent Address</span>
            <span className="info-value">{profile?.permanentAddress || 'Not provided'}</span>
          </div>
        </div>
      </div>

      {/* Employment Information */}
      <div className="profile-card">
        <h2>Employment Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label"><FiBriefcase /> Employee ID</span>
            <span className="info-value">{profile?.employeeId || 'Not assigned'}</span>
          </div>
          <div className="info-item">
            <span className="info-label"><FiBriefcase /> Designation</span>
            <span className="info-value">{profile?.designation || 'Not assigned'}</span>
          </div>
          <div className="info-item">
            <span className="info-label"><FiCalendar /> Joining Date</span>
            <span className="info-value">{formatDate(profile?.joiningDate || profile?.createdAt)}</span>
          </div>
          <div className="info-item">
            <span className="info-label"><FiBriefcase /> Employment Type</span>
            <span className="info-value">{profile?.employmentType ? profile.employmentType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Not specified'}</span>
          </div>
        </div>
      </div>

      {/* CNIC Images Section */}
      <div className="profile-card">
        <h2>CNIC Images</h2>
        <div className="cnic-images-grid">
          {/* CNIC Front */}
          <div className="cnic-section">
            <h3>CNIC Front</h3>
            <div className="cnic-preview">
              {profile?.cnicFrontImage ? (
                <img src={profile.cnicFrontImage} alt="CNIC Front" />
              ) : (
                <div className="cnic-placeholder">
                  <FiCreditCard size={48} />
                  <p>No image uploaded</p>
                </div>
              )}
            </div>
          </div>

            {/* Documents Section - visible only to management users */}
            {['ceo','co_ceo','company_manager'].includes(profile?.role) && (
            <div className="profile-card">
              <h2>Documents</h2>
              <div className="documents-section">
                <div className="cv-upload">
                  <h3>CV</h3>
                  {profile?.cv?.url ? (
                    <div className="cv-row">
                      <a href={profile.cv.url} target="_blank" rel="noreferrer">{profile.cv.originalName || 'View CV'}</a>
                      <button className="btn-delete" onClick={() => deleteDocument(profile.cv.publicId)}>Delete</button>
                    </div>
                  ) : (
                    <div className="cv-upload-controls">
                      <input type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleCvChange} />
                      <button className="btn-primary" onClick={uploadCv} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload CV'}</button>
                    </div>
                  )}
                </div>

                <div className="docs-upload">
                  <h3>Other Documents</h3>
                  <div className="docs-upload-controls">
                    <input type="file" multiple onChange={handleDocsChange} />
                    <button className="btn-primary" onClick={uploadDocuments} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload Documents'}</button>
                  </div>

                  <div className="docs-list">
                    {profile?.documents && profile.documents.length > 0 ? (
                      profile.documents.map((doc, idx) => (
                        <div key={idx} className="doc-row">
                          <a href={doc.url} target="_blank" rel="noreferrer">{doc.originalName || `Document ${idx + 1}`}</a>
                          <button className="btn-delete" onClick={() => deleteDocument(doc.publicId)}>Delete</button>
                        </div>
                      ))
                    ) : (
                      <p>No documents uploaded</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

              )}

            {/* CNIC Back */}
          <div className="cnic-section">
            <h3>CNIC Back</h3>
            <div className="cnic-preview">
              {profile?.cnicBackImage ? (
                <img src={profile.cnicBackImage} alt="CNIC Back" />
              ) : (
                <div className="cnic-placeholder">
                  <FiCreditCard size={48} />
                  <p>No image uploaded</p>
                </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Information (Read Only) */}
      <div className="profile-card">
        <h2>Account Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Username</span>
            <span className="info-value">@{profile?.username}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Role</span>
            <span className="info-value">{profile?.role?.replace('_', ' ').toUpperCase()}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Department</span>
            <span className="info-value">{profile?.department?.toUpperCase()}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Joining Date</span>
            <span className="info-value">
              {new Date(profile?.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
