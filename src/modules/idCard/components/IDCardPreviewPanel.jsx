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
 * leaving corners transparent so no extra white box or square corners exist.
 */
function clipToCurvedCard(sourceCanvas, radius = 48) {
    const w = sourceCanvas.width;
    const h = sourceCanvas.height;
    const outCanvas = document.createElement('canvas');
    outCanvas.width = w;
    outCanvas.height = h;
    const ctx = outCanvas.getContext('2d');

    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(0, 0, w, h, radius);
    } else {
        ctx.moveTo(radius, 0);
        ctx.arcTo(w, 0, w, h, radius);
        ctx.arcTo(w, h, 0, h, radius);
        ctx.arcTo(0, h, 0, 0, radius);
        ctx.arcTo(0, 0, w, 0, radius);
        ctx.closePath();
    }
    ctx.clip();
    ctx.drawImage(sourceCanvas, 0, 0, w, h);
    return outCanvas;
}

const IDCardPreviewPanel = ({
    employee,
    customPhoto,
    processedPhoto,
    isProcessingPhoto,
}) => {
    const frontRef = useRef(null);
    const backRef = useRef(null);
    const [downloading, setDownloading] = useState(false);

    const downloadFrontPNG = async () => {
        if (!frontRef.current) return;
        setDownloading(true);
        try {
            const scale = 3;
            const rawCanvas = await html2canvas(frontRef.current, {
                scale,
                useCORS: true,
                backgroundColor: null,
                logging: false,
            });

            const curvedCanvas = clipToCurvedCard(rawCanvas, 16 * scale);

            const empName = employee
                ? `${employee.firstName || ''}_${employee.lastName || ''}_${employee.staffId || ''}`.replace(/\s+/g, '_')
                : 'Front';
            const fname = `IDCard_${empName}.png`;

            triggerDownload(curvedCanvas.toDataURL('image/png'), fname);
        } catch (err) {
            console.error('Front PNG generation failed:', err);
            alert('Could not generate PNG. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    const downloadBackPNG = async () => {
        if (!backRef.current) return;
        setDownloading(true);
        try {
            const scale = 3;
            const rawCanvas = await html2canvas(backRef.current, {
                scale,
                useCORS: true,
                backgroundColor: null,
                logging: false,
            });

            const curvedCanvas = clipToCurvedCard(rawCanvas, 16 * scale);

            const empName = employee
                ? `${employee.firstName || ''}_${employee.lastName || ''}_${employee.staffId || ''}`.replace(/\s+/g, '_')
                : 'Back';
            const fname = `IDCard_Back_${empName}.png`;

            triggerDownload(curvedCanvas.toDataURL('image/png'), fname);
        } catch (err) {
            console.error('Back PNG generation failed:', err);
            alert('Could not generate PNG. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    const downloadCombinedPNG = async () => {
        if (!frontRef.current || !backRef.current) return;
        setDownloading(true);
        try {
            const scale = 3;
            const [rawFront, rawBack] = await Promise.all([
                html2canvas(frontRef.current, {
                    scale,
                    useCORS: true,
                    backgroundColor: null,
                    logging: false,
                }),
                html2canvas(backRef.current, {
                    scale,
                    useCORS: true,
                    backgroundColor: null,
                    logging: false,
                }),
            ]);

            const frontCurved = clipToCurvedCard(rawFront, 16 * scale);
            const backCurved = clipToCurvedCard(rawBack, 16 * scale);

            // Side-by-side layout: exact cards with a clean gap, NO extra outer white padding
            const gap = 36;
            const totalW = frontCurved.width + backCurved.width + gap;
            const totalH = Math.max(frontCurved.height, backCurved.height);

            const compCanvas = document.createElement('canvas');
            compCanvas.width = totalW;
            compCanvas.height = totalH;
            const ctx = compCanvas.getContext('2d');

            // Draw front card on the left
            ctx.drawImage(frontCurved, 0, 0);

            // Draw back card on the right (side by side)
            ctx.drawImage(backCurved, frontCurved.width + gap, 0);

            const empName = employee
                ? `${employee.firstName || ''}_${employee.lastName || ''}_${employee.staffId || ''}`.replace(/\s+/g, '_')
                : 'Front_and_Back';
            const fname = `IDCard_${empName}_Both_Sides.png`;

            triggerDownload(compCanvas.toDataURL('image/png'), fname);
        } catch (err) {
            console.error('Combined PNG generation failed:', err);
            alert('Could not generate PNG. Please try again.');
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

            {/* Download buttons */}
            <div className="ipp__actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                {/* Primary: Side-by-side Front + Back PNG */}
                <button
                    className={`ipp__download-btn ${downloading ? 'ipp__download-btn--loading' : ''}`}
                    onClick={downloadCombinedPNG}
                    disabled={downloading}
                    id="downloadCombinedBtn"
                    style={{ minWidth: '320px', padding: '0 32px' }}
                >
                    {downloading ? (
                        <>
                            <span className="ipp__spinner" />
                            Generating PNG...
                        </>
                    ) : (
                        <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download Front &amp; Back (PNG)
                        </>
                    )}
                </button>

                {/* Secondary buttons: Individual side downloads */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        type="button"
                        onClick={downloadFrontPNG}
                        disabled={downloading}
                        id="downloadFrontSideBtn"
                        style={{
                            height: '38px',
                            padding: '0 18px',
                            background: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        Front Side (PNG)
                    </button>

                    <button
                        type="button"
                        onClick={downloadBackPNG}
                        disabled={downloading}
                        id="downloadBackSideBtn"
                        style={{
                            height: '38px',
                            padding: '0 18px',
                            background: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        Back Side (PNG)
                    </button>
                </div>
            </div>
        </div>
    );


};

export default IDCardPreviewPanel;
