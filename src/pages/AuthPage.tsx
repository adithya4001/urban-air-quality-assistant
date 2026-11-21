import React, { useState } from 'react';
import { SignIn, SignUp } from '@clerk/react';

interface AuthPageProps {
  onBack: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-labelledby="auth-intro">
        <button className="auth-back-button" type="button" onClick={onBack}>← Back to welcome</button>
        <div className="auth-visual-content">
          <p className="landing-kicker">VaayuDootha</p>
          <h1 id="auth-intro">Make room for a better day.</h1>
          <p>Check the air around you and find a practical next step for your routine.</p>
        </div>
      </section>
      <section className="auth-form-side" aria-label="Account access">
        <div className="auth-form-wrap">
          <div className="auth-tabs" aria-label="Account access">
            <button className={mode === 'login' ? 'auth-tab active' : 'auth-tab'} type="button"
              aria-pressed={mode === 'login'} onClick={() => setMode('login')}>Login</button>
            <button className={mode === 'register' ? 'auth-tab active' : 'auth-tab'} type="button"
              aria-pressed={mode === 'register'} onClick={() => setMode('register')}>Register</button>
          </div>
          {mode === 'login'
            ? <SignIn routing="hash" fallbackRedirectUrl={window.location.origin} />
            : <SignUp routing="hash" fallbackRedirectUrl={window.location.origin} />}
        </div>
      </section>
    </main>
  );
};
