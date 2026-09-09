import React from 'react';

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
            <svg width={svgW} height={svgH} viewBox="0 0 90 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Tail */}
                <ellipse cx="9" cy="43" rx="7.5" ry="4.5" fill="#1a8c40" transform="rotate(20 9 43)" />

                {/* Back legs */}
                <ellipse cx="19" cy="57" rx="12" ry="5.5" fill="#1a8c40" transform="rotate(-12 19 57)" />
                <ellipse cx="43" cy="59" rx="12" ry="5.5" fill="#1a8c40" transform="rotate(5 43 59)" />

                {/* Front legs */}
                <ellipse cx="63" cy="57" rx="12" ry="5.5" fill="#1a8c40" transform="rotate(15 63 57)" />
                <ellipse cx="77" cy="51" rx="10" ry="4.5" fill="#1a8c40" transform="rotate(25 77 51)" />

                {/* Body */}
                <ellipse cx="44" cy="46" rx="33" ry="17" fill="#1a8c40" />

                {/* Shell dome */}
                <path d="M19 38 Q44 12 69 38 Q71 47 69 53 Q44 62 19 53 Q17 47 19 38Z" fill="#168838" />

                {/* Shell hex grid lines */}
                <line x1="44" y1="13" x2="44" y2="62" stroke="#0a5020" strokeWidth="1.2" opacity="0.55" />
                <line x1="19" y1="38" x2="69" y2="53" stroke="#0a5020" strokeWidth="1.2" opacity="0.55" />
                <line x1="69" y1="38" x2="19" y2="53" stroke="#0a5020" strokeWidth="1.2" opacity="0.55" />
                <line x1="29" y1="15" x2="59" y2="60" stroke="#0a5020" strokeWidth="1" opacity="0.45" />
                <line x1="59" y1="15" x2="29" y2="60" stroke="#0a5020" strokeWidth="1" opacity="0.45" />
                <ellipse cx="44" cy="37" rx="24" ry="15" fill="none" stroke="#0a5020" strokeWidth="1" opacity="0.35" />

                {/* Head */}
                <circle cx="79" cy="37" r="10.5" fill="#1a8c40" />

                {/* Left rabbit ear */}
                <path d="M73 27 C70 16 72.5 6 75 6 C77.5 6 78 17 75 27Z" fill="#1a8c40" />
                {/* Right rabbit ear */}
                <path d="M79 25 C77 14 79 4 81.5 4 C84 4 85 14 83 25Z" fill="#1a8c40" />

                {/* Eye */}
                <circle cx="83" cy="35" r="3.5" fill="white" />
                <circle cx="84" cy="35" r="1.8" fill="#082a10" />

                {/* Nostril */}
                <path d="M87.5 39.5 Q90 41.5 87.5 43" fill="none" stroke="#0a5020" strokeWidth="0.9" strokeLinecap="round" />
            </svg>

            {showText && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span style={{
                        fontSize: ts.brand,
                        fontWeight: 800,
                        color: '#1a8c40',
                        letterSpacing: '-0.3px',
                        lineHeight: 1.1,
                        fontFamily: 'Inter, sans-serif',
                        whiteSpace: 'nowrap',
                    }}>
                        Hare &amp; Turtle
                    </span>
                    <span style={{
                        fontSize: ts.sub,
                        fontWeight: 600,
                        color: '#1a8c40',
                        letterSpacing: '2.5px',
                        textTransform: 'uppercase',
                        fontFamily: 'Inter, sans-serif',
                        whiteSpace: 'nowrap',
                    }}>
                        AI SOLUTIONS
                    </span>
                </div>
            )}
        </div>
    );
};

export default HareTurtleLogo;
