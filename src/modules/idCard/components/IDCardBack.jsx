import React from 'react';
import hareTurtleLogoFigma from '../../../assets/logo-svg.svg';
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
                    This Access Card Belongs To  <br />
                    Hare And Turtle AI Solutions
                </p>

                <p className="idc-back__return-label">If found, please return to-</p>

                {/* Location item */}
                <div className="idc-back__detail">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#2A9246">
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
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="#2A9246">
                        <path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                    </svg>
                    <span>+91 020 2995 0394</span>
                </div>

                {/* Website item */}
                <div className="idc-back__detail">
                    <svg width="17" height="17" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.3359 21.8107C14.2159 21.9174 15.0959 21.9974 16.0026 21.9974C16.9093 21.9974 17.7893 21.9174 18.6693 21.8107V26.3174C17.8159 26.5307 16.9226 26.6641 16.0026 26.6641C15.0826 26.6641 14.1893 26.5307 13.3359 26.3174M5.92261 19.4507C7.40261 20.2507 9.00261 20.8641 10.6693 21.2907V25.2241C8.4449 23.9323 6.75994 21.8829 5.92261 19.4507ZM13.3359 19.1174V12.8774C14.2159 12.7441 15.0959 12.6641 16.0026 12.6641C16.9093 12.6641 17.8026 12.7441 18.6693 12.8774V19.1174C17.8026 19.2374 16.9093 19.3307 16.0026 19.3307C15.0959 19.3307 14.2159 19.2374 13.3359 19.1174ZM5.38927 15.9974C6.98927 14.8907 8.76261 13.9974 10.6693 13.4507V18.5441C8.76261 17.9974 6.98927 17.1041 5.38927 15.9974ZM21.3359 10.6641V6.77073C23.5666 8.04892 25.2543 10.0969 26.0826 12.5307C24.6026 11.7307 23.0026 11.1307 21.3359 10.6641ZM10.6693 6.77073V10.6641C9.00261 11.1307 7.40261 11.7307 5.92261 12.5307C6.75954 10.1018 8.44502 8.05645 10.6693 6.77073ZM13.3359 5.6774C14.1893 5.46406 15.0826 5.33073 16.0026 5.33073C16.9226 5.33073 17.8159 5.46406 18.6693 5.6774V10.1841C17.7893 10.0774 16.9093 9.9974 16.0026 9.9974C15.0959 9.9974 14.2159 10.0774 13.3359 10.1841M26.6293 15.9974C25.0293 17.1041 23.2426 17.9974 21.3359 18.5441V13.4507C23.2426 13.9974 25.0293 14.8907 26.6293 15.9974ZM21.3359 25.2241V21.2907C22.9871 20.8728 24.5811 20.2549 26.0826 19.4507C25.2426 21.9041 23.5493 23.9441 21.3359 25.2241ZM29.3359 15.9974C29.3359 8.62406 23.3359 2.66406 16.0026 2.66406C12.4664 2.66406 9.075 4.06882 6.57451 6.56931C5.3364 7.80742 4.35427 9.27727 3.68421 10.8949C3.01415 12.5126 2.66927 14.2464 2.66927 15.9974C2.66927 19.5336 4.07403 22.925 6.57451 25.4255C9.075 27.926 12.4664 29.3307 16.0026 29.3307C17.7536 29.3307 19.4874 28.9859 21.1051 28.3158C22.7227 27.6457 24.1926 26.6636 25.4307 25.4255C26.6688 24.1874 27.6509 22.7175 28.321 21.0998C28.9911 19.4822 29.3359 17.7484 29.3359 15.9974Z" fill="#2A9246" />
                    </svg>

                    <span className="idc-back__website-link">hareandturtle.ai</span>
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

