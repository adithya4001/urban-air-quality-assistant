import React from 'react';

interface HeaderProps {
  profile: { name: string; email: string };
  onExit: () => void;
  onSettings?: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ profile, onExit, onSettings, sidebarOpen, onToggleSidebar }) => (
  <header className="site-header">
    <div className="header-inner">
      <button type="button" className="header-menu-toggle" aria-label={sidebarOpen ? 'Close menu' : 'Open menu'} aria-expanded={sidebarOpen} aria-controls="daily-sidebar" onClick={onToggleSidebar}>☰</button>
      <a className="brand-lockup" href="#main-content" aria-label="VaayuDootha home">
        <span className="brand-mark" aria-hidden="true">◒</span>
        <strong>VaayuDootha</strong>
      </a>
      <div className="header-account-actions"><button className="header-location-button" onClick={onSettings}>⌖ Location & profile</button><details className="account-menu">
        <summary>
          <span className="account-avatar" aria-hidden="true">{profile.name.charAt(0).toUpperCase()}</span>
          <span>Profile</span>
        </summary>
        <div className="account-popover">
          <strong>{profile.name}</strong>
          <p>{profile.email}</p>
          <button type="button" onClick={onExit}>Sign out</button>
        </div>
      </details></div>
    </div>
  </header>
);

