import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiCreditCard, FiCalendar, FiMapPin, FiBriefcase, FiUpload, FiSave } from 'react-icons/fi';
import './EmployeeProfileEditor.css';

const EmployeeProfileEditor = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    personalEmail: '',
    phoneNumber: '',
    cnicNumber: '',
    fatherName: '',
    dateOfBirth: '',
    gender: '',
    currentAddress: '',
    permanentAddress: '',
    employeeId: '',
    designation: '',
    joiningDate: '',
    employmentType: ''
  });
  const [uploading, setUploading] = useState({
    profile: false,
    cnicFront: false,
    cnicBack: false
  });
  const [cvFile, setCvFile] = useState(null);
  const [docsFiles, setDocsFiles] = useState([]);
  const [docsUploading, setDocsUploading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get(`/profile/user/${userId}`);
      const userData = response.data.data.user;
      setUser(userData);
      
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        personalEmail: userData.personalEmail || '',
        phoneNumber: userData.phoneNumber || '',
        cnicNumber: userData.cnicNumber || '',
        fatherName: userData.fatherName || '',
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: userData.gender || '',
        currentAddress: userData.currentAddress || '',
        permanentAddress: userData.permanentAddress || '',
        employeeId: userData.employeeId || '',
        designation: userData.designation || '',
        joiningDate: userData.joiningDate ? new Date(userData.joiningDate).toISOString().split('T')[0] : '',
        employmentType: userData.employmentType || ''
      });
    } catch (error) {
      toast.error('Failed to load employee profile');
      navigate('/dashboard/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/profile/manage/${userId}`, formData);
      toast.success('Employee profile updated successfully!');
      fetchUserProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update employee profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    const formData = new FormData();
    let endpoint = '';
    let fieldName = '';

    if (type === 'profile') {
      formData.append('profilePicture', file);
      endpoint = `/profile/manage/${userId}/upload-picture`;
      fieldName = 'profile';
    } else if (type === 'cnicFront') {
      formData.append('cnicFront', file);
      endpoint = `/profile/manage/${userId}/upload-cnic-front`;
      fieldName = 'cnicFront';
    } else if (type === 'cnicBack') {
      formData.append('cnicBack', file);
      endpoint = `/profile/manage/${userId}/upload-cnic-back`;
      fieldName = 'cnicBack';
    }

    setUploading({ ...uploading, [fieldName]: true });

    try {
      await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Image uploaded successfully!');
      fetchUserProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading({ ...uploading, [fieldName]: false });
    }
  };

  // Documents (CV + multiple) upload for this user (management)
  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCvFile(file);
    // auto-upload on select
    uploadCvForUser(file);
  };

  const handleDocsChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;
    setDocsFiles(files);
    // auto-upload on select
    uploadDocumentsForUser(files);
  };

  const uploadCvForUser = async (fileArg) => {
    const file = fileArg || cvFile;
    if (!file) return toast.error('Select a CV to upload');
    setDocsUploading(true);
    try {
      const fd = new FormData();
      fd.append('cv', file);
      await api.post(`/profile/manage/${userId}/upload-cv`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('CV uploaded for user');
      fetchUserProfile();
      setCvFile(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload CV');
    } finally {
      setDocsUploading(false);
    }
  };

  const uploadDocumentsForUser = async (filesArg) => {
    const files = filesArg || docsFiles;
    if (!files || files.length === 0) return toast.error('Select documents to upload');
    setDocsUploading(true);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('documents', f));
      await api.post(`/profile/manage/${userId}/upload-documents`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Documents uploaded for user');
      fetchUserProfile();
      setDocsFiles([]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload documents');
    } finally {
      setDocsUploading(false);
    }
  };

  const deleteDocumentForUser = async (publicId) => {
    if (!window.confirm('Delete this document for the user?')) return;
    try {
      await api.delete(`/profile/manage/${userId}/document/delete?publicId=${encodeURIComponent(publicId)}`);
      toast.success('Document deleted for user');
      fetchUserProfile();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete document');
    }
  };

  const viewDocumentForUser = async (publicId, originalName) => {
    try {
      setDocsUploading(true);
      const resp = await api.get(`/profile/manage/${userId}/document/download?publicId=${encodeURIComponent(publicId)}`, { responseType: 'blob' });
      const blob = new Blob([resp.data], { type: resp.headers['content-type'] || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      // open in new tab
      window.open(url, '_blank');
      setDocsUploading(false);
    } catch (err) {
      console.error('Error viewing document', err);
      toast.error('Failed to open document');
      setDocsUploading(false);
    }
  };

  if (loading) {
    return <div className="editor-loading">Loading employee profile...</div>;
  }

  if (!user) {
    return <div className="editor-error">Employee not found</div>;
  }

  return (
    <div className="employee-editor-container">
      <div className="editor-header">
        <button className="back-btn" onClick={() => navigate('/dashboard/admin')}>
          <FiArrowLeft /> Back to Admin Panel
        </button>
        <h1>✏️ Edit Employee Profile</h1>
        <p>Managing profile for: <strong>{user.firstName} {user.lastName}</strong></p>
      </div>

      {/* Profile Picture Section */}
      <div className="editor-card">
        <h2>Profile Picture</h2>
        <div className="profile-picture-section">
          <div className="profile-picture-preview">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" />
            ) : (
              <div className="profile-avatar-large">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
          </div>
          <div className="upload-controls">
            <input
              type="file"
              id="profilePictureInput"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'profile')}
              style={{ display: 'none' }}
            />
            <label htmlFor="profilePictureInput" className="upload-btn">
              <FiUpload /> {uploading.profile ? 'Uploading...' : 'Upload New Picture'}
            </label>
            <p className="upload-hint">Max 5MB (JPG, PNG)</p>
          </div>
        </div>
      </div>

      {/* Personal Information Form */}
      <form onSubmit={handleSubmit}>
        <div className="editor-card">
          <h2>Personal Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>
                <FiUser /> First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FiUser /> Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FiUser /> Father Name
              </label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                placeholder="Enter father name"
              />
            </div>

            <div className="form-group">
              <label>
                <FiCalendar /> Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>
                <FiUser /> Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <FiMail /> Company Email (Read Only)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="readonly-field"
              />
            </div>

            <div className="form-group">
              <label>
                <FiMail /> Personal Email
              </label>
              <input
                type="email"
                value={formData.personalEmail}
                onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                placeholder="personal@email.com"
              />
            </div>

            <div className="form-group">
              <label>
                <FiPhone /> Phone Number
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+92 300 1234567"
              />
            </div>

            <div className="form-group">
              <label>
                <FiCreditCard /> CNIC Number
              </label>
              <input
                type="text"
                value={formData.cnicNumber}
                onChange={(e) => setFormData({ ...formData, cnicNumber: e.target.value })}
                placeholder="12345-1234567-1"
                maxLength="15"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="editor-card">
          <h2>Address Information</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>
                <FiMapPin /> Current Address
              </label>
              <textarea
                value={formData.currentAddress}
                onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                placeholder="Enter current address"
                rows="3"
              />
            </div>

            <div className="form-group full-width">
              <label>
                <FiMapPin /> Permanent Address
              </label>
              <textarea
                value={formData.permanentAddress}
                onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                placeholder="Enter permanent address"
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="editor-card">
          <h2>Employment Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>
                <FiBriefcase /> Employee ID
              </label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="EMP-001"
              />
            </div>

            <div className="form-group">
              <label>
                <FiBriefcase /> Designation
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>

            <div className="form-group">
              <label>
                <FiCalendar /> Joining Date
              </label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>
                <FiBriefcase /> Employment Type
              </label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
              >
                <option value="">Select Type</option>
                <option value="full-time">Full-Time</option>
                <option value="part-time">Part-Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div className="form-group">
              <label>Role (Read Only)</label>
              <input
                type="text"
                value={user?.role?.replace('_', ' ').toUpperCase() || ''}
                disabled
                className="readonly-field"
              />
            </div>

            <div className="form-group">
              <label>Department (Read Only)</label>
              <input
                type="text"
                value={user?.department?.toUpperCase() || ''}
                disabled
                className="readonly-field"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={saving}>
            <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* CNIC Images Section */}
      <div className="editor-card">
        <h2>CNIC Images</h2>
        <div className="cnic-images-grid">
          {/* CNIC Front */}
          <div className="cnic-upload-section">
            <h3>CNIC Front</h3>
            <div className="cnic-preview">
              {user?.cnicFrontImage ? (
                <img src={user.cnicFrontImage} alt="CNIC Front" />
              ) : (
                <div className="cnic-placeholder">
                  <FiCreditCard size={48} />
                  <p>No image uploaded</p>
                </div>
              )}
            </div>
            <input
              type="file"
              id="cnicFrontInput"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'cnicFront')}
              style={{ display: 'none' }}
            />
            <label htmlFor="cnicFrontInput" className="upload-btn secondary">
              <FiUpload /> {uploading.cnicFront ? 'Uploading...' : 'Upload CNIC Front'}
            </label>
          </div>

          {/* CNIC Back */}
          <div className="cnic-upload-section">
            <h3>CNIC Back</h3>
            <div className="cnic-preview">
              {user?.cnicBackImage ? (
                <img src={user.cnicBackImage} alt="CNIC Back" />
              ) : (
                <div className="cnic-placeholder">
                  <FiCreditCard size={48} />
                  <p>No image uploaded</p>
                </div>
              )}
            </div>
            <input
              type="file"
              id="cnicBackInput"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'cnicBack')}
              style={{ display: 'none' }}
            />
            <label htmlFor="cnicBackInput" className="upload-btn secondary">
              <FiUpload /> {uploading.cnicBack ? 'Uploading...' : 'Upload CNIC Back'}
            </label>
          </div>
        </div>
      </div>

      {/* Documents (Management) Section */}
      <div className="editor-card">
        <h2>Documents (Management)</h2>

        <div className="documents-grid">
          <div className="doc-section">
            <h3>CV</h3>
            <div className="doc-preview">
              {user?.cv ? (
                <div className="doc-present">
                  <button className="doc-link" onClick={() => viewDocumentForUser(user.cv.publicId, user.cv.originalName)}>View CV</button>
                  <p className="upload-hint">Uploaded: {user.cv.uploadedAt ? new Date(user.cv.uploadedAt).toLocaleDateString() : '—'}</p>
                </div>
              ) : (
                <div className="doc-empty">
                  <p>No CV uploaded</p>
                </div>
              )}
            </div>

            <div className="upload-controls">
              <input
                type="file"
                id="cvInput"
                accept=".pdf,.doc,.docx"
                onChange={handleCvChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="cvInput" className="upload-btn">
                <FiUpload /> {cvFile ? cvFile.name : 'Select CV'}
              </label>
              <p className="upload-hint">Allowed: PDF, DOC, DOCX — Max 5MB</p>
              {/* Upload occurs immediately on file select */}
            </div>
          </div>

          <div className="doc-section">
            <h3>Other Documents</h3>
            <div className="doc-list">
              {user?.documents && user.documents.length > 0 ? (
                user.documents.map(doc => (
                  <div key={doc.publicId} className="doc-item">
                    <button className="doc-link" onClick={() => viewDocumentForUser(doc.publicId, doc.originalName)}>{doc.originalName || 'Document'}</button>
                    <span className="doc-meta">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ''}</span>
                    <button className="delete-doc" onClick={() => deleteDocumentForUser(doc.publicId)}>Delete</button>
                  </div>
                ))
              ) : (
                <p>No documents uploaded</p>
              )}
            </div>

            <div className="upload-controls">
              <input
                type="file"
                id="docsInput"
                multiple
                onChange={handleDocsChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="docsInput" className="upload-btn">
                <FiUpload /> {docsFiles && docsFiles.length ? `${docsFiles.length} file(s) selected` : 'Select Documents'}
              </label>
              <p className="upload-hint">You can select multiple files. Allowed types: any (docs, pdf, images). Max 5MB each.</p>
              {/* Upload occurs immediately on file select */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileEditor;
