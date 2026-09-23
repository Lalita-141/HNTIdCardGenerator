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
    processedPhoto,
    isProcessingPhoto: _isProcessingPhoto,
    photoTransform = { zoom: 1, x: 0, y: 0 },
    onPhotoTransformChange,
    onSwitchMode,
}) => {
    const fileInputRef = useRef(null);
    const [avatarError, setAvatarError] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => onPhotoUpload(ev.target.result);
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') onGenerate();
    };

    const rawPhotoSrc = customPhoto
        ? customPhoto
        : formatProfileImage(employee?.profilePicture);
    const photoSrc = processedPhoto || rawPhotoSrc;

    useEffect(() => {
        setAvatarError(false);
    }, [photoSrc]);

    const hasAvatar = Boolean(photoSrc) && !avatarError;

    return (
        <div className="efp">
            {/* Mode Switcher Tabs */}
            {onSwitchMode && (
                <div className="bep__tabs" style={{ marginBottom: '12px' }} role="tablist">
                    <button
                        type="button"
                        className="bep__tab-btn bep__tab-btn--active"
                        role="tab"
                        aria-selected="true"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        Single Card
                    </button>
                    <button
                        type="button"
                        className="bep__tab-btn"
                        onClick={() => onSwitchMode('bulk')}
                        role="tab"
                        aria-selected="false"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                        Bulk Generate
                        <span className="bep__tab-badge">127</span>
                    </button>
                </div>
            )}

            {/* Panel title */}
            <div className="efp__header">
                <h1 className="efp__title">ID Card Generator</h1>
                <p className="efp__subtitle">Search employee, upload photo and generate ID card.</p>
            </div>

            {/* Search */}
            <div className="efp__section">
                <p className="efp__section-label">Enter Employee</p>
                <div className="efp__search-wrap">
                    {/* <svg className="efp__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg> */}
                    <input
                        id="searchStaffId"
                        className="efp__search-input"
                        type="text"
                        placeholder="Enter employee ID...1639"
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
                            {employee?.profilePicture ? 'Reset to Profile Photo' : 'Remove Photo'}
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
                            <img src={processedPhoto || customPhoto} alt="Uploaded" className="efp__upload-thumb" />
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
                            <p className="efp__upload-hint">Passport size · White background · JPG, PNG</p>
                        </>
                    )}
                </div>

                {/* Interactive Photo Adjustment Controls */}
                {Boolean(customPhoto || employee?.profilePicture) && (
                    <div className="efp__adjust-card">
                        <div className="efp__adjust-header">
                            <span className="efp__adjust-title">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    <line x1="11" y1="8" x2="11" y2="14" />
                                    <line x1="8" y1="11" x2="14" y2="11" />
                                </svg>
                                Adjust Photo Framing
                            </span>
                            <button
                                type="button"
                                className="efp__adjust-reset-btn"
                                onClick={() => onPhotoTransformChange?.({ zoom: 1, x: 0, y: 0 })}
                                title="Reset to Center & Default Size"
                            >
                                ⟲ Reset
                            </button>
                        </div>

                        {/* Zoom row */}
                        <div className="efp__adjust-row">
                            <span className="efp__adjust-label">Zoom</span>
                            <div className="efp__zoom-control">
                                <button
                                    type="button"
                                    className="efp__zoom-step-btn"
                                    onClick={() => onPhotoTransformChange?.({
                                        ...photoTransform,
                                        zoom: Math.max(0.5, Number(((photoTransform?.zoom || 1) - 0.05).toFixed(2))),
                                    })}
                                    title="Zoom Out"
                                >
                                    −
                                </button>
                                <input
                                    type="range"
                                    className="efp__zoom-slider"
                                    min="50"
                                    max="250"
                                    step="5"
                                    value={Math.round((photoTransform?.zoom || 1) * 100)}
                                    onChange={(e) => onPhotoTransformChange?.({
                                        ...photoTransform,
                                        zoom: Number(e.target.value) / 100,
                                    })}
                                />
                                <button
                                    type="button"
                                    className="efp__zoom-step-btn"
                                    onClick={() => onPhotoTransformChange?.({
                                        ...photoTransform,
                                        zoom: Math.min(2.5, Number(((photoTransform?.zoom || 1) + 0.05).toFixed(2))),
                                    })}
                                    title="Zoom In"
                                >
                                    +
                                </button>
                                <span className="efp__zoom-val">{Math.round((photoTransform?.zoom || 1) * 100)}%</span>
                            </div>
                        </div>

                        {/* Position Nudge Controls */}
                        <div className="efp__adjust-pos-wrap">
                            <span className="efp__adjust-label">Position</span>
                            <div className="efp__nudge-dpad">
                                <button
                                    type="button"
                                    className="efp__nudge-btn efp__nudge-btn--up"
                                    onClick={() => onPhotoTransformChange?.({
                                        ...photoTransform,
                                        y: (photoTransform?.y || 0) - 8,
                                    })}
                                    title="Move Up"
                                    aria-label="Move Up"
                                >
                                    ▲
                                </button>
                                <div className="efp__nudge-row">
                                    <button
                                        type="button"
                                        className="efp__nudge-btn efp__nudge-btn--left"
                                        onClick={() => onPhotoTransformChange?.({
                                            ...photoTransform,
                                            x: (photoTransform?.x || 0) - 8,
                                        })}
                                        title="Move Left"
                                        aria-label="Move Left"
                                    >
                                        ◀
                                    </button>
                                    <span className="efp__nudge-center" />
                                    <button
                                        type="button"
                                        className="efp__nudge-btn efp__nudge-btn--right"
                                        onClick={() => onPhotoTransformChange?.({
                                            ...photoTransform,
                                            x: (photoTransform?.x || 0) + 8,
                                        })}
                                        title="Move Right"
                                        aria-label="Move Right"
                                    >
                                        ▶
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    className="efp__nudge-btn efp__nudge-btn--down"
                                    onClick={() => onPhotoTransformChange?.({
                                        ...photoTransform,
                                        y: (photoTransform?.y || 0) + 8,
                                    })}
                                    title="Move Down"
                                    aria-label="Move Down"
                                >
                                    ▼
                                </button>
                            </div>
                            <span className="efp__adjust-hint-text">
                                Drag photo directly on card to adjust position, or scroll to zoom.
                            </span>
                        </div>
                    </div>
                )}

                {/* Photo guidelines / instruction */}
                <div className="efp__photo-instruction">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span>
                        <strong>Photo Guideline:</strong> Please upload a <strong>passport-size photo</strong> with a <strong>plain white background</strong>.
                    </span>
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
                        Get Employee Details
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
