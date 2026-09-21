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

// Exact 300 DPI CR80 PVC card standard dimensions (54mm × 85.6mm / 2.125" × 3.375")
export const CARD_EXPORT_WIDTH = 638;
export const CARD_EXPORT_HEIGHT = 1011;
export const CARD_CORNER_RADIUS = 36; // 3.18mm standard CR80 corner radius at 300 DPI

/**
 * Clips canvas to exact 638×1011 card rounded corners.
 * For PNG: corners remain 100% transparent (no outer white box or square edges).
 * For JPG: corners are filled with clean white.
 * Also strokes a crisp subtle border along the curve for clear boundary definition.
 */
function clipToCurvedCard(
    sourceCanvas,
    targetW = CARD_EXPORT_WIDTH,
    targetH = CARD_EXPORT_HEIGHT,
    radius = CARD_CORNER_RADIUS,
    isJpg = false
) {
    // Exact target dimensions: tightly cropped with no outer margins
    const outCanvas = document.createElement('canvas');
    outCanvas.width = targetW;
    outCanvas.height = targetH;
    const ctx = outCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // For JPG, fill with clean white (since JPEG spec has no alpha channel)
    // For PNG, keep outer corners 100% transparent.
    if (isJpg) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);
    } else {
        ctx.clearRect(0, 0, targetW, targetH);
    }

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

    // 1. Clip and draw card content scaled cleanly to 638x1011 with rounded corners
    ctx.save();
    drawCardPath(0, 0, targetW, targetH, radius);
    ctx.clip();
    ctx.drawImage(sourceCanvas, 0, 0, targetW, targetH);
    ctx.restore();

    // 2. Stroke subtle border along the rounded contour so the curve is clearly defined
    const strokeWidth = 2; // ~2px crisp stroke at 638x1011
    const halfStroke = strokeWidth / 2;
    ctx.save();
    drawCardPath(halfStroke, halfStroke, targetW - strokeWidth, targetH - strokeWidth, Math.max(0, radius - halfStroke));
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

    const renderCardCanvas = async (cardElement, scale = 3, isJpg = false) => {
        const rawCanvas = await html2canvas(cardElement, {
            scale,
            useCORS: true,
            backgroundColor: null,
            logging: false,
            onclone: (clonedDoc) => {
                // html2canvas does not implement CSS object-fit: cover for <img> elements,
                // causing images with different aspect ratios to be squished vertically.
                // Here we calculate the exact cover geometry and set explicit position & size on the clone.
                const origImg = cardElement.querySelector('.idc__photo-img');
                const clonedImg = clonedDoc.querySelector('.idc__photo-img');
                if (origImg && clonedImg && origImg.naturalWidth && origImg.naturalHeight) {
                    const nw = origImg.naturalWidth;
                    const nh = origImg.naturalHeight;
                    const wrap = origImg.parentElement;
                    const cw = wrap ? wrap.offsetWidth : 250;
                    const ch = wrap ? wrap.offsetHeight : 220;

                    const s = Math.max(cw / nw, ch / nh);
                    const rw = nw * s;
                    const rh = nh * s;
                    const rx = (cw - rw) / 2;
                    const ry = 0; // matching 'center top'

                    clonedImg.style.position = 'absolute';
                    clonedImg.style.left = `${rx}px`;
                    clonedImg.style.top = `${ry}px`;
                    clonedImg.style.width = `${rw}px`;
                    clonedImg.style.height = `${rh}px`;
                    clonedImg.style.objectFit = 'fill';
                }
            }
        });
        return clipToCurvedCard(rawCanvas, CARD_EXPORT_WIDTH, CARD_EXPORT_HEIGHT, CARD_CORNER_RADIUS, isJpg);
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

            // Side-by-side layout: exact 638x1011 cards with a clean gap
            const gap = 36;
            const totalW = frontCurved.width + backCurved.width + gap;
            const totalH = Math.max(frontCurved.height, backCurved.height);

            const compCanvas = document.createElement('canvas');
            compCanvas.width = totalW;
            compCanvas.height = totalH;
            const ctx = compCanvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            if (isJpg) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, totalW, totalH);
            } else {
                ctx.clearRect(0, 0, totalW, totalH);
            }

            ctx.drawImage(frontCurved, 0, 0);
            ctx.drawImage(backCurved, frontCurved.width + gap, 0);

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

    const downloadBothSeparately = async () => {
        if (!frontRef.current || !backRef.current) return;
        setDownloading(true);
        try {
            const isJpg = exportFormat === 'jpg';
            const [frontCurved, backCurved] = await Promise.all([
                renderCardCanvas(frontRef.current, 2.5, isJpg),
                renderCardCanvas(backRef.current, 2.5, isJpg),
            ]);
            const empName = getEmployeeSlug();
            const ext = exportFormat;
            const mime = isJpg ? 'image/jpeg' : 'image/png';

            triggerDownload(frontCurved.toDataURL(mime, 0.98), `IDCard_${empName}_Front.${ext}`);
            setTimeout(() => {
                triggerDownload(backCurved.toDataURL(mime, 0.98), `IDCard_${empName}_Back.${ext}`);
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

                {/* Secondary buttons: Individual side downloads */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        type="button"
                        onClick={downloadFront}
                        disabled={downloading || isProcessingPhoto}
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
                            cursor: (downloading || isProcessingPhoto) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            opacity: (downloading || isProcessingPhoto) ? 0.6 : 1,
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
                        disabled={downloading || isProcessingPhoto}
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
                            cursor: (downloading || isProcessingPhoto) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            opacity: (downloading || isProcessingPhoto) ? 0.6 : 1,
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Back Side ({exportFormat.toUpperCase()})
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
