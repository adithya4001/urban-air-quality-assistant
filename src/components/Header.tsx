import React from 'react';

export type DisplayMode = 'system' | 'light' | 'dark';
export type SurfaceBrightness = 'soft' | 'standard' | 'bright';

interface HeaderProps {
  profile: { name: string; email: string };
  mode: DisplayMode;
  brightness: SurfaceBrightness;
  onModeChange: (mode: DisplayMode) => void;
  onBrightnessChange: (brightness: SurfaceBrightness) => void;
  onExit: () => void;
}

export const Header: React.FC<HeaderProps> = ({ profile, mode, brightness, onModeChange, onBrightnessChange, onExit }) => (
  <header className="site-header">
    <div className="header-inner">
      <a className="brand-lockup" href="#main-content" aria-label="VaayuDootha home">
        <span className="brand-mark" aria-hidden="true">◒</span>
        <strong>VaayuDootha</strong>
      </a>
      <details className="account-menu">
        <summary>
          <span className="account-avatar" aria-hidden="true">{profile.name.charAt(0).toUpperCase()}</span>
          <span>Profile & display</span>
        </summary>
        <div className="account-popover">
          <strong>{profile.name}</strong>
          <p>{profile.email || 'Local browser session'}</p>
          <label htmlFor="display-mode">Appearance</label>
          <select id="display-mode" value={mode} onChange={(event) => onModeChange(event.target.value as DisplayMode)}>
            <option value="system">Match device</option><option value="light">Light</option><option value="dark">Dark</option>
          </select>
          <label htmlFor="display-brightness">Page brightness</label>
          <select id="display-brightness" value={brightness} onChange={(event) => onBrightnessChange(event.target.value as SurfaceBrightness)}>
            <option value="soft">Soft</option><option value="standard">Standard</option><option value="bright">Bright</option>
          </select>
          <button type="button" onClick={onExit}>Exit workspace</button>
        </div>
      </details>
    </div>
  </header>
);

