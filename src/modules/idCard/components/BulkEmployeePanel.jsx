import React from 'react';
import './BulkEmployeePanel.css';

const BulkEmployeePanel = ({
    onSwitchMode,
    bulkState,
    frontRef,
    backRef,
    onPreviewEmployee,
}) => {
    const {
        employees,
        filteredEmployees,
        searchQuery,
        setSearchQuery,
        selectedCount,
        isAllSelected,
        isGenerating,
        generationComplete,
        progress,
        bgMode,
        setBgMode,
        generatedZipBlob,
        toggleEmployee,
        selectAll,
        unselectAll,
        invertSelection,
        startBulkGeneration,
        stopBulkGeneration,
        downloadZipAgain,
    } = bulkState;

    const handleGenerateClick = () => {
        startBulkGeneration({ frontRef });
    };

    const doneCount = employees.filter((e) => e.status === 'done').length;

    return (
        <div className="bep">
            {/* Mode Switcher Tabs */}
            <div className="bep__tabs" role="tablist">
                <button
                    type="button"
                    className="bep__tab-btn"
                    onClick={() => onSwitchMode('single')}
                    role="tab"
                    aria-selected="false"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    Single Card
                </button>
                <button
                    type="button"
                    className="bep__tab-btn bep__tab-btn--active"
                    role="tab"
                    aria-selected="true"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    Bulk Generate
                    <span className="bep__tab-badge">{employees.length}</span>
                </button>
            </div>

            {/* Header */}
            <div className="bep__header">
                <h1 className="bep__title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A9246" strokeWidth="2.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="9" y1="3" x2="9" y2="21" />
                        <line x1="14" y1="8" x2="18" y2="8" />
                        <line x1="14" y1="12" x2="18" y2="12" />
                        <line x1="14" y1="16" x2="18" y2="16" />
                    </svg>
                    Bulk ID Card Generator
                </h1>
                <p className="bep__subtitle">
                    Select all or choose selective employees to download high-resolution Front JPG cards as ZIP.
                </p>
            </div>

            {/* Toolbar: Check All, Uncheck All, Status Pill */}
            <div className="bep__toolbar">
                <div className="bep__toolbar-actions">
                    <button
                        type="button"
                        className={`bep__tool-btn ${isAllSelected ? 'bep__tool-btn--primary' : ''}`}
                        onClick={selectAll}
                        disabled={isGenerating}
                        title="Select all employees"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Check All
                    </button>
                    <button
                        type="button"
                        className="bep__tool-btn"
                        onClick={unselectAll}
                        disabled={isGenerating || selectedCount === 0}
                        title="Deselect all employees"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        Uncheck All
                    </button>
                    <button
                        type="button"
                        className="bep__tool-btn"
                        onClick={invertSelection}
                        disabled={isGenerating}
                        title="Invert current selection"
                    >
                        ⇄ Invert
                    </button>
                </div>
                <div className="bep__counter-pill">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {selectedCount} of {employees.length} Selected
                </div>
            </div>

            {/* Instant Search Filter */}
            <div className="bep__search-wrap">
                <svg className="bep__search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    className="bep__search-input"
                    placeholder="Filter by employee code or name... (e.g. 1184 or Kunal)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isGenerating}
                />
                {searchQuery && (
                    <button
                        type="button"
                        className="bep__search-clear"
                        onClick={() => setSearchQuery('')}
                        title="Clear filter"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Options Strip */}
            <div className="bep__options-strip">
                <span>Card Side:</span>
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#15803d',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    padding: '3px 9px',
                    borderRadius: '12px'
                }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Only Front Side (CR80)
                </span>

                <span>Background:</span>
                <select
                    className="bep__opt-select"
                    value={bgMode}
                    onChange={(e) => setBgMode(e.target.value)}
                    disabled={isGenerating}
                >
                    <option value="green">Template Green (AI Cutout)</option>
                    <option value="original">Original Photo</option>
                </select>
            </div>

            {/* Scrollable Employee Checklist Table */}
            <div className="bep__list-wrap">
                <table className="bep__table">
                    <thead className="bep__thead">
                        <tr>
                            <th className="bep__th bep__th--check">
                                <input
                                    type="checkbox"
                                    className="bep__checkbox"
                                    checked={isAllSelected}
                                    onChange={(e) => (e.target.checked ? selectAll() : unselectAll())}
                                    disabled={isGenerating}
                                    title="Check/Uncheck All"
                                />
                            </th>
                            <th className="bep__th bep__th--code">Emp ID</th>
                            <th className="bep__th">Employee Name</th>
                            <th className="bep__th bep__th--action">Preview</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="bep__empty">
                                    No employees found matching "{searchQuery}"
                                </td>
                            </tr>
                        ) : (
                            filteredEmployees.map((emp) => {
                                const rowClass = [
                                    'bep__row',
                                    emp.selected ? 'bep__row--selected' : '',
                                    emp.status === 'processing' ? 'bep__row--processing' : '',
                                    emp.status === 'done' ? 'bep__row--done' : '',
                                    emp.status === 'error' ? 'bep__row--error' : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ');

                                return (
                                    <tr
                                        key={emp.code}
                                        className={rowClass}
                                        onClick={() => !isGenerating && toggleEmployee(emp.code)}
                                    >
                                        <td
                                            className="bep__td bep__td--check"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="checkbox"
                                                className="bep__checkbox"
                                                checked={emp.selected}
                                                onChange={() => toggleEmployee(emp.code)}
                                                disabled={isGenerating}
                                            />
                                        </td>
                                        <td className="bep__td">
                                            <span className="bep__emp-code">{emp.code}</span>
                                        </td>
                                        <td className="bep__td">
                                            <div className="bep__emp-name">
                                                <span>{emp.name}</span>
                                                {emp.status === 'processing' && (
                                                    <span className="bep__status-pill bep__status-pill--processing">
                                                        Generating...
                                                    </span>
                                                )}
                                                {emp.status === 'done' && (
                                                    <span className="bep__status-pill bep__status-pill--done">
                                                        ✓ Done
                                                    </span>
                                                )}
                                                {emp.status === 'error' && (
                                                    <span className="bep__status-pill bep__status-pill--error">
                                                        ! Failed
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td
                                            className="bep__td"
                                            style={{ textAlign: 'right' }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                type="button"
                                                className="bep__preview-btn"
                                                onClick={() => onPreviewEmployee?.(emp.code)}
                                                disabled={isGenerating}
                                                title={`Preview ${emp.name}'s card`}
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Live Progress Card (During Generation) */}
            {isGenerating && (
                <div className="bep__progress-card" role="status" aria-live="polite">
                    <div className="bep__progress-header">
                        <span>Generating ID Cards...</span>
                        <span>{progress.percent}%</span>
                    </div>
                    <div className="bep__progress-sub">
                        <span className="bep__spinner" style={{ width: '13px', height: '13px', borderWidth: '2px', borderTopColor: '#16a34a' }} />
                        Card {progress.current} of {progress.total}: <strong>{progress.currentName}</strong> ({progress.currentCode})
                    </div>
                    {progress.stepText && (
                        <div style={{ fontSize: '11px', color: '#166534', fontStyle: 'italic', paddingLeft: '19px' }}>
                            {progress.stepText}
                        </div>
                    )}
                    <div className="bep__progress-track">
                        <div
                            className="bep__progress-fill"
                            style={{ width: `${progress.percent}%` }}
                        />
                    </div>
                    <div className="bep__progress-actions">
                        <button
                            type="button"
                            className="bep__cancel-btn"
                            onClick={stopBulkGeneration}
                        >
                            ✕ Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Success Summary (After Generation) */}
            {generationComplete && !isGenerating && (
                <div className="bep__success-card">
                    <div className="bep__success-title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        All Done! {doneCount} Front ID Cards Downloaded as ZIP.
                    </div>
                    <p className="bep__success-text">
                        The ZIP archive containing the Front JPG ID cards has been downloaded automatically to your device.
                    </p>
                    <div className="bep__success-buttons">
                        {generatedZipBlob && (
                            <button
                                type="button"
                                className="bep__download-pill-btn"
                                onClick={downloadZipAgain}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="21 8 21 21 3 21 3 8" />
                                    <rect x="1" y="3" width="22" height="5" />
                                    <line x1="10" y1="12" x2="14" y2="12" />
                                </svg>
                                Download ZIP Again
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Main Action Button */}
            {!isGenerating && (
                <button
                    type="button"
                    className="bep__generate-btn"
                    onClick={handleGenerateClick}
                    disabled={selectedCount === 0}
                    id="bulkGenerateBtn"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    {selectedCount === 0
                        ? 'Select at least 1 employee'
                        : selectedCount === employees.length
                        ? `⚡ Bulk Generate All (${employees.length} Front Cards as ZIP)`
                        : `⚡ Generate Selected (${selectedCount} Front Cards as ZIP)`}
                </button>
            )}
        </div>
    );
};

export default BulkEmployeePanel;
