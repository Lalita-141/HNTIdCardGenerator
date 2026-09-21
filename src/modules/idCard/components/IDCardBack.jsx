import React from 'react';
import cardBackTemplate from '../../../assets/card_back_template.jpg';
import './IDCard.css';

/**
 * IDCardBack — Uses official designer template image as background
 * displaying full return address, contact details, and corporate logo.
 */
const IDCardBack = ({ cardRef }) => (
    <div className="idc idc--back" ref={cardRef}>
        <img
            src={cardBackTemplate}
            alt="ID Card Back Template"
            className="idc__bg-template"
            draggable={false}
        />
    </div>
);

export default IDCardBack;
