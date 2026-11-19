import React from 'react';

interface LandingPageProps {
  onSignIn: () => void;
  onTryDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, onTryDemo }) => (
  <div className="landing-page">
    <header className="landing-nav" role="banner">
      <a className="landing-brand" href="#welcome" aria-label="BreatheSafe welcome">
        <span className="landing-brand-mark" aria-hidden="true">◒</span>
        <span><strong>BreatheSafe</strong><small>Urban air decisions, made human</small></span>
      </a>
      <nav className="landing-nav-links" aria-label="Welcome navigation">
        <a href="#why-breathesafe">Why BreatheSafe</a>
        <a href="#how-it-works">How it works</a>
        <button className="landing-signin-link" type="button" onClick={onSignIn}>Sign in</button>
      </nav>
    </header>

    <main id="welcome">
      <section
        className="landing-hero"
        aria-labelledby="landing-title"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty('--pointer-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
          event.currentTarget.style.setProperty('--pointer-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
        }}
      >
        <div className="landing-sun-flare" aria-hidden="true" />
        <div className="landing-cloud cloud-left" aria-hidden="true">☁︎</div>
        <div className="landing-cloud cloud-right" aria-hidden="true">☁︎</div>
        <div className="landing-light-streak" aria-hidden="true" />
        <div className="landing-hero-copy">
          <p className="landing-kicker"><span className="pulse-dot" aria-hidden="true" /> WINTER AIR DECISION COMPANION</p>
          <h1 id="landing-title">Know the air.<br /><em>Choose your next move.</em></h1>
          <p className="landing-lede">
            BreatheSafe turns pollution, weather, location, and your everyday routine into calm, practical guidance for safer days outside and cleaner air inside.
          </p>
          <div className="landing-hero-actions">
            <button className="landing-primary-button" type="button" onClick={onSignIn}>Build my air plan <span aria-hidden="true">↗</span></button>
            <button className="landing-ghost-button" type="button" onClick={onTryDemo}>Explore the demo</button>
          </div>
          <p className="landing-note">Personalized for residents, families, commuters, and outdoor-active people.</p>
        </div>

        <div className="landing-hero-visual" aria-label="Example BreatheSafe decision preview">
          <div className="visual-orbit visual-orbit-one" aria-hidden="true" />
          <div className="visual-orbit visual-orbit-two" aria-hidden="true" />
          <div className="air-glass-card">
            <div className="air-card-topline"><span className="live-tag"><span className="pulse-dot" aria-hidden="true" /> LIVE SNAPSHOT</span><span>07:42 AM</span></div>
            <div className="air-card-location"><span className="location-pin" aria-hidden="true">⌖</span><div><strong>Delhi, India</strong><small>Cold air · low wind · urban basin</small></div></div>
            <div className="air-score-row"><div><small className="metric-caption">CURRENT AQI</small><strong className="air-score-number">164</strong><span className="air-score-status">Unhealthy</span></div><div className="air-ring" aria-hidden="true"><span>PM<br />2.5</span></div></div>
            <div className="decision-divider" />
            <p className="decision-label">YOUR NEXT BEST MOVE</p>
            <div className="decision-main"><span className="decision-icon" aria-hidden="true">🌬️</span><div><strong>Swap the morning run</strong><span>Try an indoor workout; take the metro for your commute.</span></div></div>
            <div className="decision-footer"><span>Asthma-aware plan</span><span>Why this? ↗</span></div>
          </div>
          <span className="floating-chip chip-weather">☁ 9°C · low wind</span>
          <span className="floating-chip chip-family">✦ Family-safe choices</span>
        </div>
      </section>

      <section className="landing-proof-row" aria-label="BreatheSafe principles">
        <div><span className="proof-icon" aria-hidden="true">◎</span><div><strong>Live conditions</strong><small>Weather + AQI context</small></div></div>
        <div><span className="proof-icon" aria-hidden="true">⌁</span><div><strong>Personal context</strong><small>Health, habits, and place</small></div></div>
        <div><span className="proof-icon" aria-hidden="true">✦</span><div><strong>Explainable GenAI</strong><small>Simple answers, safer actions</small></div></div>
      </section>

      <section id="why-breathesafe" className="landing-story-section" aria-labelledby="story-title">
        <div className="section-intro-block"><p className="landing-kicker dark-kicker">WHY THIS MATTERS</p><h2 id="story-title">The air changes.<br />Your plan should too.</h2><p>One AQI number cannot tell a jogger, a parent, a commuter, and an asthma patient the same thing. BreatheSafe translates the situation into a decision each person can actually use.</p></div>
        <div className="story-visual" aria-label="BreatheSafe input to action flow">
          <div className="story-clouds" aria-hidden="true">☁︎　☁︎　☁︎</div>
          <div className="story-flow-node"><span aria-hidden="true">🌫️</span><strong>Air + winter</strong><small>AQI, wind, temperature</small></div>
          <div className="story-flow-line" aria-hidden="true">↓</div>
          <div className="story-flow-node node-person"><span aria-hidden="true">🧭</span><strong>Your context</strong><small>Place, body, routine</small></div>
          <div className="story-flow-line" aria-hidden="true">↓</div>
          <div className="story-flow-node node-action"><span aria-hidden="true">✅</span><strong>One clear next move</strong><small>Protect yourself + the city</small></div>
        </div>
      </section>

      <section id="how-it-works" className="landing-use-section" aria-labelledby="use-title">
        <div className="landing-section-heading"><p className="landing-kicker dark-kicker">MADE FOR REAL LIFE</p><h2 id="use-title">A small check-in before the day begins.</h2><p>Whether you are stepping out, planning a school run, or choosing a workout, the assistant gives you a practical plan in seconds.</p></div>
        <div className="audience-grid">
          <article className="audience-card audience-card-featured"><span className="audience-emoji" aria-hidden="true">🏃</span><h3>Outdoor-active people</h3><p>Know whether to run, walk, cycle, or move today’s activity indoors.</p><span className="audience-link">Time your exposure better ↗</span></article>
          <article className="audience-card"><span className="audience-emoji" aria-hidden="true">👨‍👩‍👧</span><h3>Families</h3><p>Protect the most sensitive person at home with a shared, calmer routine.</p><span className="audience-link">Plan the day together ↗</span></article>
          <article className="audience-card"><span className="audience-emoji" aria-hidden="true">🚇</span><h3>Everyday commuters</h3><p>Compare practical travel choices and reduce roadside exposure and emissions.</p><span className="audience-link">Choose a cleaner route ↗</span></article>
        </div>
      </section>

      <section className="landing-cta-section" aria-labelledby="cta-title"><div><p className="landing-kicker">YOUR DAY, WITH MORE CLARITY</p><h2 id="cta-title">Start with the air around you.</h2><p>Your first plan takes less than a minute. The guidance gets smarter as your context gets clearer.</p></div><button className="landing-primary-button light-button" type="button" onClick={onSignIn}>Enter BreatheSafe <span aria-hidden="true">↗</span></button></section>
    </main>

    <footer className="landing-footer"><span>© BreatheSafe · PromptWars Challenge 06</span><span>General environmental guidance only · Not medical diagnosis</span></footer>
  </div>
);
