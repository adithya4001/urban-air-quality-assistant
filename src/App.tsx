import React, { useState } from 'react';
import { DashboardPage } from './pages/DashboardPage';
import { AuthPage } from './pages/AuthPage';
import { LandingPage } from './pages/LandingPage';
import { Header } from './components/Header';

type AppScreen = 'welcome' | 'auth' | 'dashboard';

function getInitialScreen(): AppScreen {
  try {
    return window.sessionStorage.getItem('breathesafe.session') ? 'dashboard' : 'welcome';
  } catch {
    return 'welcome';
  }
}

export const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(getInitialScreen);

  const enterDashboard = (email = 'demo@breathesafe.app') => {
    try { window.sessionStorage.setItem('breathesafe.session', email); } catch { /* optional session convenience */ }
    setScreen('dashboard');
  };

  if (screen === 'welcome') return <LandingPage onSignIn={() => setScreen('auth')} onTryDemo={() => enterDashboard()} />;
  if (screen === 'auth') return <AuthPage onBack={() => setScreen('welcome')} onAuthenticated={enterDashboard} onTryDemo={() => enterDashboard()} />;

  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <DashboardPage />
    </div>
  );
};

export default App;
