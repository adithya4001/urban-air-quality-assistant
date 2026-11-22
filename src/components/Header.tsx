import React from 'react';

interface HeaderProps {
  profile: { name: string; email: string };
  onExit: () => void;
  onSettings?: () => void;
  onEditProfile: () => void;
  onAppSettings: () => void;
  onPersonalDetails: () => void;
  onDailyPlan: () => void;
  avatarUrl?: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ profile, onExit, onSettings, onEditProfile, onAppSettings, onPersonalDetails, onDailyPlan, avatarUrl, sidebarOpen, onToggleSidebar }) => (
  <header className="site-header">
    <div className="header-inner">
      <button type="button" className="header-menu-toggle" aria-label={sidebarOpen ? 'Close menu' : 'Open menu'} aria-expanded={sidebarOpen} aria-controls="daily-sidebar" onClick={onToggleSidebar}>☰</button>
      <a className="brand-lockup" href="#main-content" aria-label="VaayuDootha home">
        <span className="brand-mark" aria-hidden="true">◒</span>
        <strong>VaayuDootha</strong>
      </a>
      <div className="header-account-actions"><button className="header-location-button" onClick={onSettings}>⌖ Set location</button><details className="account-menu">
        <summary>
          <span className="account-avatar" aria-hidden="true">{avatarUrl ? <img src={avatarUrl} alt="" /> : profile.name.charAt(0).toUpperCase()}</span>
          <span>Profile</span>
        </summary>
        <div className="account-popover">
          <strong>{profile.name}</strong>
          <p>{profile.email}</p>
          <button type="button" onClick={onEditProfile}>Edit profile & photo</button>
          <button type="button" onClick={onPersonalDetails}>Personal details</button>
          <button type="button" onClick={onDailyPlan}>Daily plan setup</button>
          <button type="button" onClick={onAppSettings}>App settings</button>
          <button type="button" onClick={onSettings}>Set location</button>
          <button type="button" onClick={onExit}>Sign out</button>
        </div>
      </details></div>
    </div>
  </header>
);

