import React, { useState } from 'react';
import { ExampleAirReports } from '../components/ExampleAirReports';
import { AirDecisionFlow } from '../components/AirDecisionFlow';
import { AudienceCards } from '../components/AudienceCards';

interface LandingPageProps { onSignIn: () => void; onStartPlan: () => void }

export const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, onStartPlan }) => (
  <div className="landing-page new-home">
    <header className="landing-nav" role="banner">
      <a className="landing-brand" href="#home"><span className="landing-brand-mark" aria-hidden="true">◒</span><span><strong>VaayuDootha</strong><small>Urban air decisions, made human</small></span></a>
      <nav className="landing-nav-links" aria-label="Main navigation"><a href="#why-breathesafe">Why VaayuDootha</a><a href="#how-it-works">How it works</a><button className="landing-signin-link" onClick={onSignIn}>Login</button></nav>
    </header>
    <main id="home">
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-sun-flare" aria-hidden="true" />
        <div className="landing-cloud cloud-left" aria-hidden="true">☁︎</div>
        <div className="landing-cloud cloud-right" aria-hidden="true">☁︎</div>
        <div className="landing-light-streak" aria-hidden="true" />
        <div className="landing-hero-copy">
          <p className="landing-kicker"><span className="pulse-dot" aria-hidden="true" /> WINTER AIR DECISION COMPANION</p>
          <h1 id="landing-title"><span>Know the air.</span> <span>Choose your</span> <span>next move.</span></h1>
          <p className="landing-lede">VaayuDootha turns pollution, weather, location, and your everyday routine into calm, practical guidance for safer days outside and cleaner air inside.</p>
          <div className="landing-hero-actions"><button className="landing-primary-button" type="button" onClick={onStartPlan}>Build my air plan <span aria-hidden="true">↗</span></button><button className="landing-ghost-button" type="button" onClick={onStartPlan}>Explore the demo</button></div>
          <p className="landing-note">Personalized for residents, families, commuters, and outdoor-active people.</p>
        </div>
        <ExampleAirReports />
      </section>
      <section className="landing-proof-row" aria-label="VaayuDootha principles">
        <div><span className="proof-icon" aria-hidden="true">◎</span><div><strong>Live conditions</strong><small>Weather + AQI context</small></div></div>
        <div><span className="proof-icon" aria-hidden="true">⌁</span><div><strong>Personal context</strong><small>Health, habits, and place</small></div></div>
        <div><span className="proof-icon" aria-hidden="true">✦</span><div><strong>Explainable GenAI</strong><small>Simple answers, safer actions</small></div></div>
      </section>

      <div className="landing-atmosphere">
      <section id="why-breathesafe" className="landing-story-section" aria-labelledby="story-title">
        <div className="section-intro-block"><p className="landing-kicker dark-kicker">WHY THIS MATTERS</p><h2 id="story-title">The air changes.<br />Your plan should too.</h2><p>One AQI number cannot tell a jogger, a parent, a commuter, and an asthma patient the same thing. VaayuDootha translates the situation into a decision each person can actually use.</p></div>
        <AirDecisionFlow />
      </section>

      <section id="how-it-works" className="landing-use-section" aria-labelledby="use-title">
        <div className="landing-section-heading"><p className="landing-kicker dark-kicker">MADE FOR REAL LIFE</p><h2 id="use-title">A small check-in before the day begins.</h2><p>Whether you are stepping out, planning a school run, or choosing a workout, the assistant gives you a practical plan in seconds.</p></div>
        <AudienceCards />
      </section>
      <section className="landing-cta-section" aria-labelledby="cta-title">
        <img className="landing-cta-photo" src="https://images.pexels.com/photos/4684392/pexels-photo-4684392.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="" loading="lazy" decoding="async" />
        <div className="landing-cta-copy">
          <p className="landing-kicker">YOUR DAY, WITH MORE CLARITY</p>
          <h2 id="cta-title">Start with the air around you.</h2>
          <p>Bring your location and routine together for a more informed day.</p>
          <button className="landing-primary-button light-button" type="button" onClick={onStartPlan}>Enter VaayuDootha <span aria-hidden="true">↗</span></button>
        </div>
      </section>
      </div>
    </main>
  </div>
);

type PersonalContext = { name: string; city: string; hobbies: string; sensitivities: string; workDays: string; workHours: string; workPlace: string; commute: string };
const emptyContext: PersonalContext = { name:'', city:'', hobbies:'', sensitivities:'', workDays:'', workHours:'', workPlace:'', commute:'' };
export const PlanSetupModal: React.FC<{ onClose: () => void; onContinue: () => void }> = ({ onClose, onContinue }) => {
  const [step, setStep] = useState(0);
  const [context, setContext] = useState<PersonalContext>(() => { try { return { ...emptyContext, ...JSON.parse(localStorage.getItem('vaayudootha.context') || '{}') }; } catch { return emptyContext; } });
  const field = (key: keyof PersonalContext, label: string, placeholder: string, type = 'text') => <label className="setup-field">{label}<input type={type} value={context[key]} placeholder={placeholder} onChange={e=>setContext({...context,[key]:e.target.value})}/></label>;
  const save = () => { localStorage.setItem('vaayudootha.context', JSON.stringify(context)); onContinue(); };
  return <div className="setup-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section className="setup-modal" role="dialog" aria-modal="true" aria-labelledby="setup-title"><button className="setup-close" aria-label="Close setup" onClick={onClose}>×</button><p className="landing-kicker dark-kicker">YOUR PERSONAL AIR PLAN · STEP {step+1} OF 2</p><h2 id="setup-title">{step===0?'Tell us about your day.':'Map your workday.'}</h2><p className="setup-intro">{step===0?'A little context helps tailor safer, practical suggestions.':'Add the routine details that shape your commute and outdoor exposure.'}</p><div className="setup-fields">{step===0?<>{field('name','Name','Your name')}{field('city','City or location','e.g. Hyderabad')}{field('hobbies','Outdoor activities & hobbies','Walking, running, gardening…')}{field('sensitivities','Health sensitivities (optional)','Asthma, allergies, none…')}</>:<>{field('workPlace','Workplace or work area','Office, campus, home…')}{field('workDays','Workdays','Mon–Fri')}{field('workHours','Work hours','9:00 AM – 5:00 PM')}{field('commute','Commute and travel','Metro, bus, walking…')}</>}</div><div className="setup-actions"><button className="landing-ghost-button" onClick={()=>step===0?onClose():setStep(0)}>{step===0?'Cancel':'Back'}</button>{step===0?<button className="landing-primary-button" onClick={()=>setStep(1)}>Workday details <span>→</span></button>:<button className="landing-primary-button" onClick={save}>Open my air assistant <span>↗</span></button>}</div><p className="setup-privacy">Your context is saved in this browser for your next visit.</p></section></div>;
};
