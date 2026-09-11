import React from 'react';
import hareTurtleLogoFigma from '../../../assets/logo-svg.svg';
import { formatProfileImage } from '../../../utils/imageUtils';
import './IDCard.css';

/**
 * IDCardFront — 100% exact match to Figma design:
 *   - Logo header: exact Figma logo asset (254px × 52px at x=42, y=24)
 *   - Geometric photo section:
 *       orange block: x=22, y=119, w=60, h=59
 *       photo area: x=42, y=136, w=263, h=183 (mint green when present, solid gray when absent)
 *       gradient column: x=241, y=136, w=68, h=243
 *       royal blue accent: x=302, y=349, w=19, h=60
 *       translucent green box: x=242, y=379, w=60, h=56
 *   - Employee Info:
 *       Name at x=43, y=351
 *       Staff ID at x=43, y=388
 *       Blood Group at x=175, y=388
 *   - Footer:
 *       Velocity X Innovation | hareandturtle.ai at y=509..520
 */
const IDCardFront = ({
    employee,
    customPhoto,
    processedPhoto,
    isProcessingPhoto,
    photoTransform = { zoom: 1, x: 0, y: 0 },
    onPhotoTransformChange,
    cardRef,
}) => {
    const [imgError, setImgError] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);
    const dragStartRef = React.useRef({ startX: 0, startY: 0, initX: 0, initY: 0 });
    const photoWrapRef = React.useRef(null);

    let profileSrc = null;
    if (processedPhoto) {
        profileSrc = processedPhoto;
    } else if (customPhoto) {
        profileSrc = customPhoto;
    } else if (employee?.profilePicture) {
        profileSrc = formatProfileImage(employee.profilePicture);
    }

    React.useEffect(() => {
        setImgError(false);
    }, [profileSrc]);

    const displayName = employee
        ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Employee'
        : 'Employee Name';
    const displayStaffId = employee?.staffId ?? 'Emp Id';
    const displayBloodGroup = employee?.bloodGroup ?? '';

    const hasValidPhoto = Boolean(profileSrc) && !imgError;

    // Pointer events for smooth mouse & touch dragging
    const handlePointerDown = (e) => {
        if (!hasValidPhoto || isProcessingPhoto || e.button !== 0) return;
        if (e.target.closest('.idc__photo-toolbar')) return;

        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
            // fallback
        }
        setIsDragging(true);
        dragStartRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initX: photoTransform?.x || 0,
            initY: photoTransform?.y || 0,
        };
    };

    const handlePointerMove = (e) => {
        if (!isDragging || !onPhotoTransformChange) return;
        const deltaX = e.clientX - dragStartRef.current.startX;
        const deltaY = e.clientY - dragStartRef.current.startY;
        onPhotoTransformChange({
            zoom: photoTransform?.zoom || 1,
            x: Math.round(dragStartRef.current.initX + deltaX),
            y: Math.round(dragStartRef.current.initY + deltaY),
        });
    };

    const handlePointerUp = (e) => {
        if (!isDragging) return;
        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
            // ignore
        }
        setIsDragging(false);
    };

    // Wheel event for smooth mouse-wheel zooming
    React.useEffect(() => {
        const wrap = photoWrapRef.current;
        if (!wrap) return;

        const handleWheel = (e) => {
            if (!hasValidPhoto || isProcessingPhoto) return;
            e.preventDefault();
            e.stopPropagation();

            const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
            const currentZoom = photoTransform?.zoom || 1;
            const newZoom = Math.min(2.5, Math.max(0.5, Number((currentZoom + zoomDelta).toFixed(2))));

            if (onPhotoTransformChange) {
                onPhotoTransformChange({
                    zoom: newZoom,
                    x: photoTransform?.x || 0,
                    y: photoTransform?.y || 0,
                });
            }
        };

        wrap.addEventListener('wheel', handleWheel, { passive: false });
        return () => wrap.removeEventListener('wheel', handleWheel);
    }, [hasValidPhoto, isProcessingPhoto, photoTransform, onPhotoTransformChange]);

    const handleZoomIn = (e) => {
        e.stopPropagation();
        if (!onPhotoTransformChange) return;
        const currentZoom = photoTransform?.zoom || 1;
        const newZoom = Math.min(2.5, Number((currentZoom + 0.1).toFixed(2)));
        onPhotoTransformChange({
            zoom: newZoom,
            x: photoTransform?.x || 0,
            y: photoTransform?.y || 0,
        });
    };

    const handleZoomOut = (e) => {
        e.stopPropagation();
        if (!onPhotoTransformChange) return;
        const currentZoom = photoTransform?.zoom || 1;
        const newZoom = Math.max(0.5, Number((currentZoom - 0.1).toFixed(2)));
        onPhotoTransformChange({
            zoom: newZoom,
            x: photoTransform?.x || 0,
            y: photoTransform?.y || 0,
        });
    };

    const handleReset = (e) => {
        e.stopPropagation();
        if (!onPhotoTransformChange) return;
        onPhotoTransformChange({ zoom: 1, x: 0, y: 0 });
    };

    const zoomPercent = Math.round((photoTransform?.zoom || 1) * 100);

    return (
        <div className="idc idc--front" ref={cardRef}>
            {/* Header with exact Figma logo */}
            <div className="idc__header">
                <img
                    src={hareTurtleLogoFigma}
                    alt="Hare & Turtle AI Solutions"
                    className="idc__logo-img"
                />
            </div>

            {/* Orange block behind top-left of photo */}
            <div className="geo geo--orange" />

            {/* Photo wrap with interactive drag & zoom */}
            <div
                ref={photoWrapRef}
                className={`idc__photo-wrap ${!hasValidPhoto && !isProcessingPhoto ? 'idc__photo-wrap--empty' : ''} ${hasValidPhoto ? 'idc__photo-wrap--interactive' : ''} ${isDragging ? 'idc__photo-wrap--dragging' : ''}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                {hasValidPhoto ? (
                    <>
                        <img
                            src={profileSrc}
                            alt={displayName}
                            className="idc__photo-img"
                            onError={() => setImgError(true)}
                            crossOrigin="anonymous"
                            draggable={false}
                            style={{
                                transform: `translate(${photoTransform?.x || 0}px, ${photoTransform?.y || 0}px) scale(${photoTransform?.zoom || 1})`,
                                transformOrigin: 'center center',
                                transition: isDragging ? 'none' : 'transform 0.12s ease-out',
                            }}
                        />

                        {/* Interactive floating toolbar (ignored during JPG export) */}
                        {!isProcessingPhoto && (
                            <div className="idc__photo-toolbar" data-html2canvas-ignore="true">
                                <button
                                    type="button"
                                    className="idc__photo-btn"
                                    onClick={handleZoomOut}
                                    title="Zoom Out"
                                    aria-label="Zoom Out"
                                >
                                    −
                                </button>
                                <span className="idc__photo-zoom-badge">{zoomPercent}%</span>
                                <button
                                    type="button"
                                    className="idc__photo-btn"
                                    onClick={handleZoomIn}
                                    title="Zoom In"
                                    aria-label="Zoom In"
                                >
                                    +
                                </button>
                                <button
                                    type="button"
                                    className="idc__photo-btn idc__photo-btn--reset"
                                    onClick={handleReset}
                                    title="Reset to Default"
                                    aria-label="Reset to Default"
                                >
                                    ⟲
                                </button>
                            </div>
                        )}

                        {/* Subtle reposition hint on hover */}
                        {!isProcessingPhoto && (
                            <div className="idc__photo-hint" data-html2canvas-ignore="true">
                                <span>Drag to reposition · Scroll to zoom</span>
                            </div>
                        )}

                        {isProcessingPhoto && (
                            <div className="idc__photo-processing">
                                <span className="idc__photo-spinner" />
                            </div>
                        )}
                    </>
                ) : isProcessingPhoto ? (
                    <div className="idc__photo-processing">
                        <span className="idc__photo-spinner" />
                    </div>
                ) : (
                    <div className="idc__photo-placeholder idc__photo-placeholder--gray" />
                )}
            </div>

            {/* Royal blue accent block (behind gradient) */}
            <div className="geo geo--blue-sm" />

            {/* Vertical gradient column on right side (semi-transparent) */}
            <div className="geo geo--gradient" />

            {/* Translucent green overlay box */}
            {/* <div className="geo geo--green-sm" /> */}

            {/* Employee Info */}
            <div className="idc__info">
                <p className="idc__name">{displayName}</p>
                <div className="idc__meta">
                    <span className="idc__staff-id">{displayStaffId}</span>
                    <span className="idc__blood">{displayBloodGroup}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="idc__footer">
                <span className="idc__footer-left">Velocity X Innovation</span>
                <span className="idc__footer-right">hareandturtle.ai</span>
            </div>
        </div>
    );
};

export default IDCardFront;


