import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import IDCardFront from './IDCardFront';
import IDCardBack from './IDCardBack';
import './IDCardPreviewPanel.css';

function triggerDownload(dataUrl, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Clips canvas to exact card rounded corners (border-radius: 16px * scale = 48px)
 * leaving corners 100% transparent so no outer white box or square corners exist.
 * Also strokes a crisp subtle border along the curve so the boundary is visible against any surface.
 */
function clipToCurvedCard(sourceCanvas, radius = 48) {
    const w = sourceCanvas.width;
    const h = sourceCanvas.height;
    const outCanvas = document.createElement('canvas');
    outCanvas.width = w;
    outCanvas.height = h;
    const ctx = outCanvas.getContext('2d');

    // Keep background completely transparent — NO solid white fill!
    ctx.clearRect(0, 0, w, h);

    const drawCardPath = (x, y, width, height, r) => {
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(x, y, width, height, r);
        } else {
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + width, y, x + width, y + height, r);
            ctx.arcTo(x + width, y + height, x, y + height, r);
            ctx.arcTo(x, y + height, x, y, r);
            ctx.arcTo(x, y, x + width, y, r);
            ctx.closePath();
        }
    };

    // 1. Clip and draw card content with rounded corners
    ctx.save();
    drawCardPath(0, 0, w, h, radius);
    ctx.clip();
    ctx.drawImage(sourceCanvas, 0, 0, w, h);
    ctx.restore();

    // 2. Stroke subtle border along the rounded contour so the curve is clearly defined
    const strokeWidth = Math.max(1, Math.round(w / 344)); // ~3px at scale 3
    const halfStroke = strokeWidth / 2;
    ctx.save();
    drawCardPath(halfStroke, halfStroke, w - strokeWidth, h - strokeWidth, Math.max(0, radius - halfStroke));
    ctx.strokeStyle = '#e2e8f0'; // Clean crisp subtle outline matching preview border
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
    ctx.restore();

    return outCanvas;
}

const IDCardPreviewPanel = ({
    employee,
    customPhoto,
    processedPhoto,
    isProcessingPhoto,
    photoTransform,
    onPhotoTransformChange,
}) => {
    const frontRef = useRef(null);
    const backRef = useRef(null);
    const [downloading, setDownloading] = useState(false);
    const [exportFormat, setExportFormat] = useState('jpg'); // 'png' (transparent curves) | 'jpg'

    const renderCardCanvas = async (cardElement, scale = 3) => {
        const rawCanvas = await html2canvas(cardElement, {
            scale,
            useCORS: true,
            backgroundColor: null,
            logging: false,
        });
        return clipToCurvedCard(rawCanvas, 16 * scale);
    };

    const getEmployeeSlug = () => {
        return employee
            ? `${employee.firstName || ''}_${employee.lastName || ''}_${employee.staffId || ''}`.replace(/\s+/g, '_')
            : 'Employee';
    };

    const downloadFront = async () => {
        if (!frontRef.current) return;
        setDownloading(true);
        try {
            const curvedCanvas = await renderCardCanvas(frontRef.current);
            const empName = getEmployeeSlug();
            const ext = exportFormat;
            const fname = `IDCard_${empName}_Front.${ext}`;

            // Always export with full alpha transparency so corners remain curved with zero white box
            triggerDownload(curvedCanvas.toDataURL('image/png'), fname);
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
            const curvedCanvas = await renderCardCanvas(backRef.current);
            const empName = getEmployeeSlug();
            const ext = exportFormat;
            const fname = `IDCard_${empName}_Back.${ext}`;

            // Always export with full alpha transparency so corners remain curved with zero white box
            triggerDownload(curvedCanvas.toDataURL('image/png'), fname);
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
            const [frontCurved, backCurved] = await Promise.all([
                renderCardCanvas(frontRef.current),
                renderCardCanvas(backRef.current),
            ]);

            // Side-by-side layout: exact cards with a clean gap, NO outer white box!
            const gap = 36;
            const totalW = frontCurved.width + backCurved.width + gap;
            const totalH = Math.max(frontCurved.height, backCurved.height);

            const compCanvas = document.createElement('canvas');
            compCanvas.width = totalW;
            compCanvas.height = totalH;
            const ctx = compCanvas.getContext('2d');

            // 100% transparent background — no white box, no gray box!
            ctx.clearRect(0, 0, totalW, totalH);
            ctx.drawImage(frontCurved, 0, 0);
            ctx.drawImage(backCurved, frontCurved.width + gap, 0);

            const empName = getEmployeeSlug();
            const ext = exportFormat;
            triggerDownload(compCanvas.toDataURL('image/png'), `IDCard_${empName}_Both_Sides.${ext}`);
        } catch (err) {
            console.error('Combined download failed:', err);
            alert('Could not download ID Card. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    const downloadBothSeparately = async () => {
        if (!frontRef.current || !backRef.current) return;
        setDownloading(true);
        try {
            const [frontCurved, backCurved] = await Promise.all([
                renderCardCanvas(frontRef.current),
                renderCardCanvas(backRef.current),
            ]);
            const empName = getEmployeeSlug();
            const ext = exportFormat;

            // Download both sides as separate curved cards with no white box
            triggerDownload(frontCurved.toDataURL('image/png'), `IDCard_${empName}_Front.${ext}`);
            setTimeout(() => {
                triggerDownload(backCurved.toDataURL('image/png'), `IDCard_${empName}_Back.${ext}`);
            }, 300);
        } catch (err) {
            console.error('Both cards download failed:', err);
            alert('Could not download ID Cards. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="ipp">
            {/* Panel header */}
            <div className="ipp__header">
                <h2 className="ipp__title">ID Card Preview</h2>
                <p className="ipp__subtitle">Front and back view will be generated automatically.</p>
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
            <div className="ipp__actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', }}>

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
                            background: exportFormat === 'png' ? '#188f16' : 'transparent',
                            color: exportFormat === 'png' ? '#ffffff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <span>PNG</span>
                        <span style={{ fontSize: '10px', opacity: 0.9 }}>(Curved · No White Box)</span>
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
                            background: exportFormat === 'jpg' ? '#188f16' : 'transparent',
                            color: exportFormat === 'jpg' ? '#ffffff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <span>JPG</span>
                        <span style={{ fontSize: '10px', opacity: 0.9 }}>(Curved · No White Box)</span>
                    </button>
                </div>

                {/* Secondary buttons: Individual side downloads */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        type="button"
                        onClick={downloadFront}
                        disabled={downloading}
                        id="downloadFrontSideBtn"
                        style={{
                            height: '38px',
                            padding: '0 16px',
                            background: '#ffffff',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Front Side ({exportFormat.toUpperCase()})
                    </button>

                    <button
                        type="button"
                        onClick={downloadBack}
                        disabled={downloading}
                        id="downloadBackSideBtn"
                        style={{
                            height: '38px',
                            padding: '0 16px',
                            background: '#ffffff',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Back Side ({exportFormat.toUpperCase()})
                    </button>

                    {/* <button
                        type="button"
                        onClick={downloadBothSeparately}
                        disabled={downloading}
                        id="downloadBothSeparatelyBtn"
                        style={{
                            height: '38px',
                            padding: '0 16px',
                            background: '#f0fdf4',
                            color: '#166534',
                            border: '1px solid #bbf7d0',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                        title="Download both sides as separate files at once"
                    >
                        Both Sides (2 Files)
                    </button> */}
                </div>

                {/* Primary: Front + Back */}
                <button
                    className={`ipp__download-btn ${downloading ? 'ipp__download-btn--loading' : ''}`}
                    onClick={downloadCombined}
                    disabled={downloading}
                    id="downloadCombinedBtn"
                    style={{ minWidth: '320px', padding: '0 32px' }}
                >
                    {downloading ? (
                        <>
                            <span className="ipp__spinner" />
                            Generating Card...
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
