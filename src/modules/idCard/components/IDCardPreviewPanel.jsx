import React, { useRef, useState } from 'react';
import IDCardFront from './IDCardFront';
import IDCardBack from './IDCardBack';
import {
    triggerDownload,
    renderCardCanvas,
    createCombinedCardCanvas,
    createIdCardsPdf,
    addEmployeeToPdf,
} from '../../../utils/cardRenderer';
import './IDCardPreviewPanel.css';

const IDCardPreviewPanel = ({
    employee,
    customPhoto,
    processedPhoto,
    isProcessingPhoto,
    photoTransform,
    onPhotoTransformChange,
    frontRef: externalFrontRef,
    backRef: externalBackRef,
}) => {
    const internalFrontRef = useRef(null);
    const internalBackRef = useRef(null);
    const frontRef = externalFrontRef || internalFrontRef;
    const backRef = externalBackRef || internalBackRef;

    const [downloading, setDownloading] = useState(false);
    const [exportFormat, setExportFormat] = useState('jpg'); // 'png' (transparent curves) | 'jpg'

    const getEmployeeSlug = () => {
        return employee
            ? `${employee.firstName || ''}_${employee.lastName || ''}_${employee.staffId || ''}`.replace(/\s+/g, '_')
            : 'Employee';
    };

    const downloadFront = async () => {
        if (!frontRef.current) return;
        setDownloading(true);
        try {
            const isJpg = exportFormat === 'jpg';
            const curvedCanvas = await renderCardCanvas(frontRef.current, 2.5, isJpg);
            const empName = getEmployeeSlug();
            const ext = exportFormat;
            const fname = `IDCard_${empName}_Front.${ext}`;
            const mime = isJpg ? 'image/jpeg' : 'image/png';

            triggerDownload(curvedCanvas.toDataURL(mime, 0.98), fname);
        } catch (err) {
            console.error('Front card download failed:', err);
            alert('Could not download Front Card. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    const downloadBack = async () => {
        if (!backRef.current) return;
        setDownloading(true);
        try {
            const isJpg = exportFormat === 'jpg';
            const curvedCanvas = await renderCardCanvas(backRef.current, 2.5, isJpg);
            const empName = getEmployeeSlug();
            const ext = exportFormat;
            const fname = `IDCard_${empName}_Back.${ext}`;
            const mime = isJpg ? 'image/jpeg' : 'image/png';

            triggerDownload(curvedCanvas.toDataURL(mime, 0.98), fname);
        } catch (err) {
            console.error('Back card download failed:', err);
            alert('Could not download Back Card. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    const downloadCombined = async () => {
        if (!frontRef.current || !backRef.current) return;
        setDownloading(true);
        try {
            const isJpg = exportFormat === 'jpg';
            const [frontCurved, backCurved] = await Promise.all([
                renderCardCanvas(frontRef.current, 2.5, isJpg),
                renderCardCanvas(backRef.current, 2.5, isJpg),
            ]);

            const compCanvas = createCombinedCardCanvas(frontCurved, backCurved, 36, isJpg);
            const empName = getEmployeeSlug();
            const ext = exportFormat;
            const mime = isJpg ? 'image/jpeg' : 'image/png';
            triggerDownload(compCanvas.toDataURL(mime, 0.98), `IDCard_${empName}_Both_Sides.${ext}`);
        } catch (err) {
            console.error('Combined download failed:', err);
            alert('Could not download ID Card. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    const downloadPdf = async () => {
        if (!frontRef.current || !backRef.current) return;
        setDownloading(true);
        try {
            const [frontCurved, backCurved] = await Promise.all([
                renderCardCanvas(frontRef.current, 2.5, true),
                renderCardCanvas(backRef.current, 2.5, true),
            ]);
            const pdf = createIdCardsPdf('cr80');
            addEmployeeToPdf(pdf, frontCurved, backCurved, true, 'cr80');
            const empName = getEmployeeSlug();
            pdf.save(`IDCard_${empName}.pdf`);
        } catch (err) {
            console.error('PDF download failed:', err);
            alert('Could not download PDF. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="ipp">
            {/* Panel header */}
            <div className="ipp__header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 className="ipp__title">ID Card Preview</h2>
                    <p className="ipp__subtitle">Front and back view will be generated automatically.</p>
                </div>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11.5px',
                    fontWeight: '600',
                    color: '#15803d',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    letterSpacing: '0.2px',
                }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <line x1="9" y1="3" x2="9" y2="21"/>
                    </svg>
                    Export Size: 638 × 1011 px (CR80)
                </div>
            </div>

            {/* Cards side by side */}
            <div className="ipp__cards-row">
                {/* Front */}
                <div className="ipp__card-col">
                    <IDCardFront
                        employee={employee}
                        customPhoto={customPhoto}
                        processedPhoto={processedPhoto}
                        isProcessingPhoto={isProcessingPhoto}
                        photoTransform={photoTransform}
                        onPhotoTransformChange={onPhotoTransformChange}
                        cardRef={frontRef}
                    />
                    <span className="ipp__card-label">Front Side</span>
                </div>

                {/* Back */}
                <div className="ipp__card-col">
                    <IDCardBack cardRef={backRef} />
                    <span className="ipp__card-label">Back Side</span>
                </div>
            </div>

            {/* Download buttons & format options */}
            <div className="ipp__actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>

                {/* Format selection pill */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#f1f5f9',
                    padding: '3px',
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    gap: '4px'
                }}>
                    <button
                        type="button"
                        onClick={() => setExportFormat('png')}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '16px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            background: exportFormat === 'png' ? '#2A9246' : 'transparent',
                            color: exportFormat === 'png' ? '#ffffff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <span>PNG</span>
                        <span style={{ fontSize: '10px', opacity: 0.9 }}>(Transparent Corners)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setExportFormat('jpg')}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '16px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            background: exportFormat === 'jpg' ? '#2A9246' : 'transparent',
                            color: exportFormat === 'jpg' ? '#ffffff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <span>JPG</span>
                        <span style={{ fontSize: '10px', opacity: 0.9 }}>(Curved)</span>
                    </button>
                </div>

                {/* Secondary buttons: Individual side downloads + PDF */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        type="button"
                        onClick={downloadFront}
                        disabled={downloading || isProcessingPhoto}
                        id="downloadFrontSideBtn"
                        style={{
                            height: '38px',
                            padding: '0 14px',
                            background: '#ffffff',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: (downloading || isProcessingPhoto) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            opacity: (downloading || isProcessingPhoto) ? 0.6 : 1,
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Front Side ({exportFormat.toUpperCase()})
                    </button>

                    <button
                        type="button"
                        onClick={downloadBack}
                        disabled={downloading || isProcessingPhoto}
                        id="downloadBackSideBtn"
                        style={{
                            height: '38px',
                            padding: '0 14px',
                            background: '#ffffff',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: (downloading || isProcessingPhoto) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            opacity: (downloading || isProcessingPhoto) ? 0.6 : 1,
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Back Side ({exportFormat.toUpperCase()})
                    </button>

                    <button
                        type="button"
                        onClick={downloadPdf}
                        disabled={downloading || isProcessingPhoto}
                        id="downloadSinglePdfBtn"
                        style={{
                            height: '38px',
                            padding: '0 14px',
                            background: '#f8fafc',
                            color: '#0f766e',
                            border: '1px solid #99f6e4',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: (downloading || isProcessingPhoto) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            opacity: (downloading || isProcessingPhoto) ? 0.6 : 1,
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        Download PDF
                    </button>
                </div>

                {/* Primary: Front + Back */}
                <button
                    className={`ipp__download-btn ${downloading ? 'ipp__download-btn--loading' : ''}`}
                    onClick={downloadCombined}
                    disabled={downloading || isProcessingPhoto}
                    id="downloadCombinedBtn"
                    style={{ minWidth: '320px', padding: '0 32px' }}
                >
                    {downloading ? (
                        <>
                            <span className="ipp__spinner" />
                            Generating Card...
                        </>
                    ) : isProcessingPhoto ? (
                        <>
                            <span className="ipp__spinner" />
                            Processing Photo...
                        </>
                    ) : (
                        <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download Front &amp; Back ({exportFormat.toUpperCase()})
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default IDCardPreviewPanel;
