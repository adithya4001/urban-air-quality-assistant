import React, { useState } from 'react';

interface AuthPageProps {
  onBack: () => void;
  onAuthenticated: (profile: { name: string; email: string }) => void;
  onTryDemo: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBack, onAuthenticated, onTryDemo }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

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
      <section className="auth-form-side" aria-labelledby="auth-title">
        <div className="auth-form-wrap">
          <h2 id="auth-title">Set up your workspace</h2>
          <p className="auth-subtitle">Your local profile stays in this browser. Email is optional.</p>
          <form className="auth-form" onSubmit={(event) => {
            event.preventDefault();
            if (name.trim()) onAuthenticated({ name: name.trim(), email: email.trim() });
          }}>
            <div className="auth-field">
              <label htmlFor="auth-name">Display name</label>
              <input id="auth-name" value={name} onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Priya" autoComplete="name" maxLength={60} required />
            </div>
            <div className="auth-field">
              <label htmlFor="auth-email">Email (optional)</label>
              <input id="auth-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com" autoComplete="email" maxLength={254} />
            </div>
            <button className="auth-submit" type="submit" disabled={!name.trim()}>Open my workspace</button>
          </form>
          <div className="auth-divider"><span>or</span></div>
          <button className="demo-access-button" type="button" onClick={onTryDemo}>Explore as a guest</button>
        </div>
      </section>
    </main>
  );
};
