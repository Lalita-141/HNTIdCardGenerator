import React from 'react';
import hareTurtleLogoFigma from '../../../assets/hare_turtle_logo_figma.png';
import './IDCard.css';

/**
 * IDCardBack — 100% exact match to Figma design:
 *   - Clean off-white background (#fbfbfb)
 *   - Orange→green gradient-bordered rounded box with return address info
 *   - Filled green icons (Location pin, Phone, Globe)
 *   - Centered Hare & Turtle AI Solutions logo at bottom
 */
const IDCardBack = ({ cardRef }) => (
    <div className="idc idc--back" ref={cardRef}>
        {/* Gradient-bordered address box */}
        <div className="idc-back__box-wrap">
            <div className="idc-back__box">
                <p className="idc-back__belongs-to">
                    This Access Card Belongs To
                    Hare And Turtle AI Solutions
                </p>

                <p className="idc-back__return-label">If found, please return to-</p>

                {/* Location item */}
                <div className="idc-back__detail">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#188F16">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                    </svg>
                    <span>
                        210, 2nd Floor, Vascon<br />
                        Almonte, Kharadi, Pune,<br />
                        Maharashtra 411014
                    </span>
                </div>

                {/* Phone item */}
                <div className="idc-back__detail">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="#188F16">
                        <path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                    </svg>
                    <span>+91 020 2995 0394</span>
                </div>

                {/* Website item */}
                <div className="idc-back__detail">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#188F16" stroke="#188F16" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span>hareandturtle.ai</span>
                </div>
            </div>
        </div>

        {/* Centered bottom logo */}
        <div className="idc-back__logo">
            <img
                src={hareTurtleLogoFigma}
                alt="Hare & Turtle AI Solutions"
                className="idc-back__logo-img"
            />
        </div>
    </div>
);

export default IDCardBack;

