import React from 'react';
import HareTurtleLogo from './HareTurtleLogo';
import './Navbar.css';

const Navbar = () => (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar__left">
            <HareTurtleLogo scale={0.78} showText={true} textSize="sm" />
        </div>
        <div className="navbar__center">
            <span className="navbar__tagline">Velocity X Innovation</span>
            <span className="navbar__sep">|</span>
            <span className="navbar__web">hareandturtle.ai</span>
        </div>
        <div className="navbar__right">
            <button className="navbar__user" aria-label="User menu">
                <span className="navbar__user-avatar">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </span>
                <span className="navbar__user-name">Admin</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
        </div>
    </nav>
);

export default Navbar;
