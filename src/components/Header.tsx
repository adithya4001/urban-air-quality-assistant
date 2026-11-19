import React from 'react';

export const Header: React.FC = () => (
  <header className="site-header" role="banner">
    <div className="header-inner">
      <a className="brand-lockup" href="#main-content" aria-label="BreatheSafe home">
        <span className="brand-mark" aria-hidden="true">◒</span>
        <span>
          <strong>BreatheSafe</strong>
          <small>Urban air guidance for winter days</small>
        </span>
      </a>
      <div className="header-actions">
        <span className="status-pill"><span className="status-dot" aria-hidden="true" /> Challenge 06</span>
        <span className="header-note">Personalized · Explainable · Safety-first</span>
      </div>
    </div>
  </header>
);

