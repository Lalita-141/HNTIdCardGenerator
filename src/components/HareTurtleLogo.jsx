import React from 'react';
import Logo from '../../src/assets/logo-svg.svg'
/**
 * Hare & Turtle AI Solutions logo — turtle with rabbit ears SVG + brand text
 * Props:
 *   scale     - size multiplier (default 1 = ~52x38px svg)
 *   showText  - show brand name text (default true)
 *   textSize  - 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 */
const HareTurtleLogo = ({ scale = 1, showText = true, textSize = 'md' }) => {
    const svgW = Math.round(52 * scale);
    const svgH = Math.round(38 * scale);

    const textSizes = {
        xs: { brand: 11, sub: 5.5 },
        sm: { brand: 14, sub: 7 },
        md: { brand: 20, sub: 9 },
        lg: { brand: 26, sub: 11 },
        xl: { brand: 34, sub: 13 },
    };
    const ts = textSizes[textSize] || textSizes.md;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(svgW * 0.18) }}>
            <img src={Logo} alt="Hare & Turtle Logo" style={{ height: '45px' }} />



        </div>
    );
};

export default HareTurtleLogo;
