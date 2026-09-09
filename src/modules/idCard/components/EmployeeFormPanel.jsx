import React, { useRef, useState, useEffect } from 'react';
import samplePhoto from '../../../assets/sample_photo.png';
import { formatProfileImage } from '../../../utils/imageUtils';
import './EmployeeFormPanel.css';

const EmployeeFormPanel = ({
    staffId,
    onStaffIdChange,
    employee,
    loading,
    error,
    onGenerate,
    customPhoto,
    onPhotoUpload,
}) => {
    const fileInputRef = useRef(null);
    const [avatarError, setAvatarError] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => onPhotoUpload(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') onGenerate();
    };

    const photoSrc = customPhoto
        ? customPhoto
        : formatProfileImage(employee?.profilePicture);

    useEffect(() => {
        setAvatarError(false);
    }, [photoSrc]);

    const hasAvatar = Boolean(photoSrc) && !avatarError;

    return (
        <div className="efp">
            {/* Panel title */}
            <div className="efp__header">
                <h1 className="efp__title">ID Card Generator</h1>
                <p className="efp__subtitle">Search employee, upload photo and generate ID card.</p>
            </div>

            {/* Search */}
            <div className="efp__section">
                <p className="efp__section-label">Search Employee</p>
                <div className="efp__search-wrap">
                    <svg className="efp__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        id="searchStaffId"
                        className="efp__search-input"
                        type="text"
                        placeholder="Search by name or employee ID..."
                        value={staffId}
                        onChange={(e) => onStaffIdChange(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        disabled={loading}
                        autoComplete="off"
                    />
                </div>
                {error && (
                    <p className="efp__error" role="alert">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {error}
                    </p>
                )}
            </div>

            {/* Employee Details */}
            <div className="efp__section">
                <p className="efp__section-label">Employee Details</p>
                <div className="efp__details-card">
                    <div className="efp__details-avatar">
                        {hasAvatar ? (
                            <img
                                src={photoSrc}
                                alt="Employee"
                                className="efp__avatar-img"
                                onError={() => setAvatarError(true)}
                            />
                        ) : (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        )}
                    </div>
                    <div className="efp__details-fields">
                        <div className="efp__field">
                            <span className="efp__field-label">Name</span>
                            <span className="efp__field-value">
                                {employee ? `${employee.firstName} ${employee.lastName}` : '-'}
                            </span>
                        </div>
                        <div className="efp__field">
                            <span className="efp__field-label">Employee ID</span>
                            <span className="efp__field-value">{employee?.staffId ?? '-'}</span>
                        </div>
                        <div className="efp__field">
                            <span className="efp__field-label">Blood Group</span>
                            <span className="efp__field-value">{employee?.bloodGroup ?? '-'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Photo */}
            <div className="efp__section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <p className="efp__section-label" style={{ margin: 0 }}>Upload Photo</p>
                    {customPhoto ? (
                        <button
                            type="button"
                            className="efp__photo-toggle-btn efp__photo-toggle-btn--remove"
                            onClick={() => onPhotoUpload(null)}
                        >
                            Remove Photo (Show Gray)
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="efp__photo-toggle-btn"
                            onClick={() => onPhotoUpload(samplePhoto)}
                        >
                            Use Reference Photo
                        </button>
                    )}
                </div>
                <div
                    className={`efp__upload-zone ${customPhoto ? 'efp__upload-zone--has-photo' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                    aria-label="Upload employee photo"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        id="photoUploadInput"
                    />
                    {customPhoto ? (
                        <div className="efp__upload-preview">
                            <img src={customPhoto} alt="Uploaded" className="efp__upload-thumb" />
                            <span className="efp__upload-change">Click to change photo</span>
                        </div>
                    ) : (
                        <>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <p className="efp__upload-text">Click to upload employee photo</p>
                            <p className="efp__upload-hint">JPG, PNG | Max size: 5 MB</p>
                        </>
                    )}
                </div>
            </div>

            {/* Generate button */}
            <button
                className={`efp__generate-btn ${loading ? 'efp__generate-btn--loading' : ''}`}
                onClick={onGenerate}
                disabled={loading || !staffId.trim()}
                id="generateIdCardBtn"
            >
                {loading ? (
                    <>
                        <span className="efp__spinner" />
                        Generating...
                    </>
                ) : (
                    <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                        Generate ID Card
                    </>
                )}
            </button>

            {/* Footer tagline */}
            <div className="efp__tagline">
                <p>Building<br />Smarter Tomorrows</p>
                <div className="efp__tagline-bar" />
            </div>
        </div>
    );
};

export default EmployeeFormPanel;
