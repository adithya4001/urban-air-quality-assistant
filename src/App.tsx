import React, { useEffect, useState } from 'react';
import { DashboardPage } from './pages/DashboardPage';
import { AuthPage } from './pages/AuthPage';
import { LandingPage } from './pages/LandingPage';
import { IntroSplash } from './pages/IntroSplash';
import { Header, type DisplayMode, type SurfaceBrightness } from './components/Header';

type AppScreen = 'intro' | 'welcome' | 'auth' | 'dashboard';
const guest = { name: 'Guest', email: '' };

function readProfile() {
  try {
    const value = window.sessionStorage.getItem('breathesafe.session');
    if (!value || value === 'demo@breathesafe.app') return guest;
    if (!value.startsWith('{')) return { name: value.split('@')[0], email: value };
    const profile = JSON.parse(value);
    if (typeof profile.name === 'string' && typeof profile.email === 'string') return profile as typeof guest;
  } catch { /* Browser storage is optional. */ }
  return guest;
}

function readPreference<T extends string>(key: string, values: readonly T[], fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return values.find((item) => item === value) ?? fallback;
  } catch { return fallback; }
}

function getInitialScreen(): AppScreen {
  try {
    if (new URLSearchParams(window.location.search).get('welcome') === '1') return 'intro';
    return window.sessionStorage.getItem('breathesafe.session') ? 'dashboard' : 'intro';
  } catch {
    return 'welcome';
  }
}

export const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(getInitialScreen);
  const [profile, setProfile] = useState(readProfile);
  const [mode, setMode] = useState<DisplayMode>(() => readPreference('breathesafe.theme', ['system', 'light', 'dark'], 'system'));
  const [brightness, setBrightness] = useState<SurfaceBrightness>(() => readPreference('breathesafe.brightness', ['soft', 'standard', 'bright'], 'standard'));

  useEffect(() => {
    try {
      window.localStorage.setItem('breathesafe.theme', mode);
      window.localStorage.setItem('breathesafe.brightness', brightness);
    } catch { /* Appearance still applies for this visit. */ }
  }, [mode, brightness]);

  const enterDashboard = (nextProfile = guest) => {
    setProfile(nextProfile);
    try { window.sessionStorage.setItem('breathesafe.session', JSON.stringify(nextProfile)); } catch { /* Optional session. */ }
    setScreen('dashboard');
  };

  const leaveDashboard = () => {
    try { window.sessionStorage.removeItem('breathesafe.session'); } catch { /* Optional session. */ }
    setProfile(guest);
    setScreen('welcome');
  };

  if (screen === 'intro') return <IntroSplash onComplete={() => setScreen('welcome')} />;
  if (screen === 'welcome') return <LandingPage onSignIn={() => setScreen('auth')} onTryDemo={() => enterDashboard()} />;
  if (screen === 'auth') return <AuthPage onBack={() => setScreen('welcome')} onAuthenticated={enterDashboard} onTryDemo={() => enterDashboard()} />;

  return (
    <div className="app-container" data-theme={mode} data-brightness={brightness}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header profile={profile} mode={mode} brightness={brightness}
        onModeChange={setMode} onBrightnessChange={setBrightness} onExit={leaveDashboard} />
      <DashboardPage />
    </div>
  );
};

export default App;
