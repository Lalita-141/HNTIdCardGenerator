import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import IDCardFront from './IDCardFront';
import IDCardBack from './IDCardBack';
import './IDCardPreviewPanel.css';

const IDCardPreviewPanel = ({
    employee,
    customPhoto,
    processedPhoto,
    isProcessingPhoto,
}) => {
    const frontRef = useRef(null);
    const backRef = useRef(null);
    const [downloading, setDownloading] = useState(false);

    const downloadFrontPDF = async () => {
        if (!frontRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(frontRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });

            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();

            // Card ratio: 210 x 336 px → at A4, fit card width to 90mm centered
            const cardMM_W = 90;
            const cardMM_H = (canvas.height / canvas.width) * cardMM_W;
            const x = (pageW - cardMM_W) / 2;
            const y = (pageH - cardMM_H) / 2;

            pdf.setFillColor(248, 250, 248);
            pdf.rect(0, 0, pageW, pageH, 'F');

            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, cardMM_W, cardMM_H);

            const fname = employee
                ? `IDCard_${employee.firstName}_${employee.lastName}_${employee.staffId}.pdf`
                : 'IDCard_Front.pdf';
            pdf.save(fname);
        } catch (err) {
            console.error('PDF generation failed:', err);
            alert('Could not generate PDF. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    const downloadBackPDF = async () => {
        if (!backRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(backRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });

            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();

            const cardMM_W = 90;
            const cardMM_H = (canvas.height / canvas.width) * cardMM_W;
            const x = (pageW - cardMM_W) / 2;
            const y = (pageH - cardMM_H) / 2;

            pdf.setFillColor(248, 250, 248);
            pdf.rect(0, 0, pageW, pageH, 'F');

            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, cardMM_W, cardMM_H);

            const fname = employee
                ? `IDCard_Back_${employee.firstName}_${employee.lastName}_${employee.staffId}.pdf`
                : 'IDCard_Back.pdf';
            pdf.save(fname);
        } catch (err) {
            console.error('PDF generation failed:', err);
            alert('Could not generate PDF. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    const downloadCombinedPDF = async () => {
        if (!frontRef.current || !backRef.current) return;
        setDownloading(true);
        try {
            const [canvasFront, canvasBack] = await Promise.all([
                html2canvas(frontRef.current, {
                    scale: 3,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                }),
                html2canvas(backRef.current, {
                    scale: 3,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                }),
            ]);

            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();

            // Stack 2 cards vertically on single A4 page
            const cardMM_W = 75;
            const cardMM_H_Front = (canvasFront.height / canvasFront.width) * cardMM_W;
            const cardMM_H_Back = (canvasBack.height / canvasBack.width) * cardMM_W;
            const gapMM = 12;
            const totalH = cardMM_H_Front + cardMM_H_Back + gapMM;

            const x = (pageW - cardMM_W) / 2;
            const yFront = (pageH - totalH) / 2;
            const yBack = yFront + cardMM_H_Front + gapMM;

            // Pure white page background
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 0, pageW, pageH, 'F');

            // 1. Front Side (top)
            pdf.addImage(canvasFront.toDataURL('image/png'), 'PNG', x, yFront, cardMM_W, cardMM_H_Front);

            // 2. Back Side (below front)
            pdf.addImage(canvasBack.toDataURL('image/png'), 'PNG', x, yBack, cardMM_W, cardMM_H_Back);

            const fname = employee
                ? `IDCard_${employee.firstName}_${employee.lastName}_${employee.staffId}.pdf`
                : 'IDCard_Front_and_Back.pdf';
            pdf.save(fname);
        } catch (err) {
            console.error('Combined PDF generation failed:', err);
            alert('Could not generate PDF. Please try again.');
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
                {/* Primary: Single Page Front + Back PDF */}
                <button
                    className={`ipp__download-btn ${downloading ? 'ipp__download-btn--loading' : ''}`}
                    onClick={downloadCombinedPDF}
                    disabled={downloading}
                    id="downloadCombinedBtn"
                    style={{ minWidth: '320px', padding: '0 32px' }}
                >
                    {downloading ? (
                        <>
                            <span className="ipp__spinner" />
                            Generating PDF...
                        </>
                    ) : (
                        <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download Front &amp; Back (Single Page PDF)
                        </>
                    )}
                </button>

                {/* Secondary buttons: Individual side downloads */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        type="button"
                        onClick={downloadFrontPDF}
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
                        Front Side Only
                    </button>

                    <button
                        type="button"
                        onClick={downloadBackPDF}
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
                        Back Side Only
                    </button>
                </div>
            </div>
        </div>
    );


};

export default IDCardPreviewPanel;
