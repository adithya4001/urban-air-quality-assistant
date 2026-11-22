import React, { useEffect, useState } from 'react';
import { useClerk, useUser } from '@clerk/react';
import { DashboardPage } from './pages/DashboardPage';
import { AuthPage } from './pages/AuthPage';
import { LandingPage, PlanSetupModal } from './pages/LandingPage';
import { IntroSplash } from './pages/IntroSplash';
import { Header } from './components/Header';
import { AppPreferences } from './components/AppPreferences';

type AppScreen = 'intro' | 'welcome' | 'auth' | 'dashboard' | 'setup' | 'agent';
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
  const [settingsRequest, setSettingsRequest] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  useEffect(() => { if (!user?.id) return; try { const p = JSON.parse(localStorage.getItem(`vaayudootha.preferences.${user.id}`) || '{}'); document.documentElement.dataset.textSize = p.textSize || 'normal'; document.documentElement.dataset.appReduceMotion = String(Boolean(p.reduceMotion)); } catch { /* Defaults remain available. */ } }, [user?.id]);
  const leaveDashboard = () => { void signOut().then(() => setScreen('welcome')); };

  if (!isLoaded) return <main role="status" className="main-content">Loading your account…</main>;
  if (isSignedIn && user && screen !== 'welcome' && screen !== 'setup') {
    const email = user.primaryEmailAddress?.emailAddress ?? '';
    const profile = { name: user.fullName || user.firstName || email.split('@')[0] || 'User', email };
    return (
      <div className="app-container" data-theme="light">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <Header profile={profile} avatarUrl={user.hasImage ? user.imageUrl : undefined} onExit={leaveDashboard} onEditProfile={() => openUserProfile()} onAppSettings={() => setShowPreferences(true)} onSettings={() => setSettingsRequest(n => n + 1)} sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(open => !open)} />
        <DashboardPage key={user.id} userId={user.id} initialView={screen === 'agent' ? 'chat' : undefined} settingsRequest={settingsRequest} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {showPreferences && <AppPreferences userId={user.id} close={() => setShowPreferences(false)} />}
      </div>
    );
  }
  if (screen === 'intro') return <IntroSplash onComplete={() => setScreen('welcome')} />;
  if (screen === 'welcome' || screen === 'setup') return <><LandingPage onSignIn={() => setScreen('auth')} onStartPlan={() => setScreen(isSignedIn ? 'setup' : 'auth')} />{isSignedIn && screen === 'setup' && <PlanSetupModal onClose={() => setScreen('welcome')} onContinue={() => setScreen('agent')} />}</>;
  return <AuthPage onBack={() => setScreen('welcome')} />;
};

export default App;
