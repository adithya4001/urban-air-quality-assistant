import React from 'react';

interface HeaderProps {
  profile: { name: string; email: string };
  onExit: () => void;
}

export const Header: React.FC<HeaderProps> = ({ profile, onExit }) => (
  <header className="site-header">
    <div className="header-inner">
      <a className="brand-lockup" href="#main-content" aria-label="VaayuDootha home">
        <span className="brand-mark" aria-hidden="true">◒</span>
        <strong>VaayuDootha</strong>
      </a>
      <details className="account-menu">
        <summary>
          <span className="account-avatar" aria-hidden="true">{profile.name.charAt(0).toUpperCase()}</span>
          <span>Profile</span>
        </summary>
        <div className="account-popover">
          <strong>{profile.name}</strong>
          <p>{profile.email || 'Local browser session'}</p>
          <button type="button" onClick={onExit}>Exit workspace</button>
        </div>
      </details>
    </div>
  </header>
);

