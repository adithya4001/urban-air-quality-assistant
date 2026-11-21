import React, { useState } from 'react';
import { DashboardPage } from './pages/DashboardPage';
import { AuthPage } from './pages/AuthPage';
import { LandingPage } from './pages/LandingPage';
import { IntroSplash } from './pages/IntroSplash';
import { Header } from './components/Header';

type AppScreen = 'intro' | 'welcome' | 'auth' | 'dashboard';
const emptyProfile = { name: '', email: '' };

function getInitialScreen(): AppScreen {
  try {
    if (new URLSearchParams(window.location.search).get('welcome') === '1') return 'intro';
    return 'intro';
  } catch {
    return 'welcome';
  }
}

export const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(getInitialScreen);
  const [profile, setProfile] = useState(emptyProfile);
  const enterDashboard = (nextProfile: typeof emptyProfile) => {
    setProfile(nextProfile);
    setScreen('dashboard');
  };

  const leaveDashboard = () => {
    try { window.sessionStorage.removeItem('breathesafe.session'); } catch { /* Optional session. */ }
    setProfile(emptyProfile);
    setScreen('welcome');
  };

  if (screen === 'intro') return <IntroSplash onComplete={() => setScreen('welcome')} />;
  if (screen === 'welcome') return <LandingPage onSignIn={() => setScreen('auth')} />;
  if (screen === 'auth') return <AuthPage onBack={() => setScreen('welcome')} onAuthenticated={enterDashboard} />;

  return (
    <div className="app-container" data-theme="light">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header profile={profile} onExit={leaveDashboard} />
      <DashboardPage />
    </div>
  );
};

export default App;
