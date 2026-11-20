import React from 'react';
import { ExampleAirReports } from '../components/ExampleAirReports';

interface LandingPageProps {
  onSignIn: () => void;
  onTryDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, onTryDemo }) => (
  <div className="landing-page">
    <header className="landing-nav" role="banner">
      <a className="landing-brand" href="#welcome" aria-label="VaayuDootha welcome">
        <span className="landing-brand-mark" aria-hidden="true">◒</span>
        <span><strong>VaayuDootha</strong><small>Urban air decisions, made human</small></span>
      </a>
      <nav className="landing-nav-links" aria-label="Welcome navigation">
        <a href="#why-breathesafe">Why VaayuDootha</a>
        <a href="#how-it-works">How it works</a>
        <button className="landing-signin-link" type="button" onClick={onSignIn}>Open workspace</button>
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
          <h1 id="landing-title">
            <span>Know the air.</span>{' '}
            <span>Choose your</span>{' '}
            <span>next move.</span>
          </h1>
          <p className="landing-lede">
            VaayuDootha turns pollution, weather, location, and your everyday routine into calm, practical guidance for safer days outside and cleaner air inside.
          </p>
          <div className="landing-hero-actions">
            <button className="landing-primary-button" type="button" onClick={onSignIn}>Build my air plan <span aria-hidden="true">↗</span></button>
            <button className="landing-ghost-button" type="button" onClick={onTryDemo}>Explore the demo</button>
          </div>
          <p className="landing-note">Personalized for residents, families, commuters, and outdoor-active people.</p>
        </div>

        <ExampleAirReports />
      </section>

      <section className="landing-proof-row" aria-label="VaayuDootha principles">
        <div><span className="proof-icon" aria-hidden="true">◎</span><div><strong>Live conditions</strong><small>Weather + AQI context</small></div></div>
        <div><span className="proof-icon" aria-hidden="true">⌁</span><div><strong>Personal context</strong><small>Health, habits, and place</small></div></div>
        <div><span className="proof-icon" aria-hidden="true">✦</span><div><strong>Explainable GenAI</strong><small>Simple answers, safer actions</small></div></div>
      </section>

      <section id="why-breathesafe" className="landing-story-section" aria-labelledby="story-title">
        <div className="section-intro-block"><p className="landing-kicker dark-kicker">WHY THIS MATTERS</p><h2 id="story-title">The air changes.<br />Your plan should too.</h2><p>One AQI number cannot tell a jogger, a parent, a commuter, and an asthma patient the same thing. VaayuDootha translates the situation into a decision each person can actually use.</p></div>
        <div className="story-visual" aria-label="VaayuDootha input to action flow">
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

      <section className="landing-cta-section" aria-labelledby="cta-title"><div><p className="landing-kicker">YOUR DAY, WITH MORE CLARITY</p><h2 id="cta-title">Start with the air around you.</h2><p>Your first plan takes less than a minute. The guidance gets smarter as your context gets clearer.</p></div><button className="landing-primary-button light-button" type="button" onClick={onSignIn}>Enter VaayuDootha <span aria-hidden="true">↗</span></button></section>
    </main>

    <footer className="landing-footer"><span>© VaayuDootha · PromptWars Challenge 06</span><span>General environmental guidance only · Not medical diagnosis</span></footer>
  </div>
);
