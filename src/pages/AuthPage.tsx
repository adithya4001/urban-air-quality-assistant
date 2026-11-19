import React, { FormEvent, useState } from 'react';

interface AuthPageProps {
  onBack: () => void;
  onAuthenticated: (email: string) => void;
  onTryDemo: () => void;
}

type AuthMode = 'signin' | 'register';

export const AuthPage: React.FC<AuthPageProps> = ({ onBack, onAuthenticated, onTryDemo }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (!email.includes('@')) return setError('Enter a valid email address.');
    if (password.length < 8) return setError('Use at least 8 characters for your password.');
    if (mode === 'register' && !name.trim()) return setError('Tell us your name so the plan feels personal.');
    if (mode === 'register' && password !== confirmPassword) return setError('Passwords do not match.');
    onAuthenticated(email.trim());
  };

  const forgotPassword = () => {
    setError(null);
    setMessage(email.includes('@') ? 'A reset link would be sent to this email in the connected auth service.' : 'Enter your email first, then choose Forgot password.');
  };

  return (
    <div className="auth-page">
      <section className="auth-visual" aria-label="BreatheSafe welcome visual">
        <button className="auth-back-button" type="button" onClick={onBack}>← Back to welcome</button>
        <div className="auth-visual-content"><p className="landing-kicker"><span className="pulse-dot" aria-hidden="true" /> BREATHESAFE</p><h1>Better decisions begin with better context.</h1><p>Sign in to keep your location, resident profile, and daily air plan together.</p><div className="auth-mini-scene"><span aria-hidden="true">🌫️</span><span aria-hidden="true">→</span><span aria-hidden="true">🫁</span><span aria-hidden="true">→</span><span aria-hidden="true">🌿</span></div><small>No password is stored in this demo. Connect a production auth provider before real account use.</small></div>
        <div className="auth-visual-orb orb-a" aria-hidden="true" /><div className="auth-visual-orb orb-b" aria-hidden="true" />
      </section>
      <section className="auth-form-side" aria-labelledby="auth-title">
        <div className="auth-form-wrap">
          <div className="auth-form-header"><span className="landing-brand-mark" aria-hidden="true">◒</span><div><p className="landing-kicker dark-kicker">YOUR PRIVATE AIR DESK</p><h2 id="auth-title">{mode === 'signin' ? 'Welcome back' : 'Create your plan'}</h2></div></div>
          <p className="auth-subtitle">{mode === 'signin' ? 'Pick up where your breathing plan left off.' : 'Set up a personal space for safer everyday choices.'}</p>
          <div className="auth-tabs" role="tablist" aria-label="Account access mode"><button className={mode === 'signin' ? 'auth-tab active' : 'auth-tab'} type="button" role="tab" aria-selected={mode === 'signin'} onClick={() => { setMode('signin'); setError(null); setMessage(null); }}>Sign in</button><button className={mode === 'register' ? 'auth-tab active' : 'auth-tab'} type="button" role="tab" aria-selected={mode === 'register'} onClick={() => { setMode('register'); setError(null); setMessage(null); }}>Create account</button></div>
          <form className="auth-form" onSubmit={submit} noValidate>
            {mode === 'register' && <div className="auth-field"><label htmlFor="auth-name">Your name</label><input id="auth-name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Priya" autoComplete="name" /></div>}
            <div className="auth-field"><label htmlFor="auth-email">Email address</label><input id="auth-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></div>
            <div className="auth-field"><div className="auth-label-row"><label htmlFor="auth-password">Password</label>{mode === 'signin' && <button className="forgot-button" type="button" onClick={forgotPassword}>Forgot password?</button>}</div><input id="auth-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} required /></div>
            {mode === 'register' && <div className="auth-field"><label htmlFor="auth-confirm-password">Confirm password</label><input id="auth-confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat your password" autoComplete="new-password" required /></div>}
            {error && <p className="auth-message auth-error-message" role="alert">{error}</p>}
            {message && <p className="auth-message auth-success-message" role="status">{message}</p>}
            <button className="auth-submit" type="submit">{mode === 'signin' ? 'Continue to my plan' : 'Create my BreatheSafe space'} <span aria-hidden="true">↗</span></button>
          </form>
          <div className="auth-divider"><span>or</span></div><button className="demo-access-button" type="button" onClick={onTryDemo}>Explore with a demo profile</button><p className="auth-legal">By continuing, you agree to use BreatheSafe as general environmental guidance—not medical diagnosis or treatment.</p>
        </div>
      </section>
    </div>
  );
};
