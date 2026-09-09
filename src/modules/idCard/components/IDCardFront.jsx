import React from 'react';
import hareTurtleLogoFigma from '../../../assets/hare_turtle_logo_figma.png';
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
const IDCardFront = ({ employee, customPhoto, cardRef }) => {
    const [imgError, setImgError] = React.useState(false);

    let profileSrc = null;
    if (customPhoto) {
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

            {/* Photo wrap (or solid gray fill when empty) */}
            <div className={`idc__photo-wrap ${!hasValidPhoto ? 'idc__photo-wrap--empty' : ''}`}>
                {hasValidPhoto ? (
                    <>
                        <img 
                            src={profileSrc} 
                            style={{ display: 'none' }} 
                            onError={() => setImgError(true)} 
                            alt="" 
                        />
                        <div
                            className="idc__photo-img"
                            style={{
                                backgroundImage: `url(${profileSrc})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center top',
                                backgroundRepeat: 'no-repeat',
                                width: '100%',
                                height: '100%'
                            }}
                            title={displayName}
                        />
                    </>
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


