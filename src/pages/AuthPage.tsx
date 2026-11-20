import React, { useState } from 'react';

interface AuthPageProps {
  onBack: () => void;
  onAuthenticated: (profile: { name: string; email: string }) => void;
  onTryDemo: () => void;
}

type Mode = 'login' | 'register' | 'forgot';

export const AuthPage: React.FC<AuthPageProps> = ({ onBack, onTryDemo }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  function changeMode(next: Mode) {
    setMode(next);
    setError('');
    setPassword('');
    setConfirm('');
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === 'register' && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('Account login is not connected yet. You can explore as a guest.');
  }

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
          <h2 id="auth-title">{mode === 'register' ? 'Create your account' : mode === 'forgot' ? 'Reset your password' : 'Welcome back'}</h2>
          <p className="auth-subtitle">{mode === 'forgot' ? 'Enter the email associated with your account.' : 'Your air, your routine, your plan.'}</p>
          {mode !== 'forgot' && (
            <div className="auth-tabs" aria-label="Account access">
              <button className={mode === 'login' ? 'auth-tab active' : 'auth-tab'} type="button" aria-pressed={mode === 'login'} onClick={() => changeMode('login')}>Login</button>
              <button className={mode === 'register' ? 'auth-tab active' : 'auth-tab'} type="button" aria-pressed={mode === 'register'} onClick={() => changeMode('register')}>Register</button>
            </div>
          )}
          <p className="auth-subtitle" role="status">Account service is not connected yet. Guest access is available below.</p>
          <form className="auth-form" onSubmit={submit}>
            {mode === 'register' && (
              <div className="auth-field"><label htmlFor="auth-name">Full name</label><input id="auth-name" autoComplete="name" maxLength={100} value={name} onChange={(event) => setName(event.target.value)} required /></div>
            )}
            {(
              <div className="auth-field"><label htmlFor="auth-email">Email</label><input id="auth-email" type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
            )}
            {mode === 'register' && (
              <div className="auth-field"><label htmlFor="auth-phone">Phone number</label><input id="auth-phone" type="tel" autoComplete="tel" maxLength={25} minLength={7} value={phone} onChange={(event) => setPhone(event.target.value)} required /><small>Include your country code.</small></div>
            )}
            {mode !== 'forgot' && (
              <div className="auth-field"><div className="auth-label-row"><label htmlFor="auth-password">Password</label>{mode === 'login' && <button className="forgot-button" type="button" onClick={() => changeMode('forgot')}>Forgot password?</button>}</div>
                <input id="auth-password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} required />
              </div>
            )}
            {mode === 'register' && (
              <div className="auth-field"><label htmlFor="auth-confirm">Confirm password</label><input id="auth-confirm" type="password" autoComplete="new-password" minLength={8} maxLength={72} value={confirm} onChange={(event) => setConfirm(event.target.value)} required /></div>
            )}
            {error && <p className="auth-message auth-error-message" role="alert">{error}</p>}
            <button className="auth-submit" type="submit">{mode === 'forgot' ? 'Send reset link' : mode === 'register' ? 'Create account' : 'Login'}</button>
          </form>
          {mode === 'forgot' && <button className="forgot-button" type="button" onClick={() => changeMode('login')}>Back to login</button>}
          {<><div className="auth-divider"><span>or</span></div><button className="demo-access-button" type="button" onClick={onTryDemo}>Explore as a guest</button></>}
        </div>
      </section>
    </main>
  );
};
