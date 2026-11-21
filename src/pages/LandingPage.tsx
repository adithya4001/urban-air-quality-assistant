import React, { useState } from 'react';
import { ExampleAirReports } from '../components/ExampleAirReports';

interface LandingPageProps { onSignIn: () => void; onStartPlan: () => void }

const audiences = [
  { icon: '🏃', title: 'Outdoor routines', text: 'Runners, walkers and sports groups choosing when and how intensely to train.' },
  { icon: '🏡', title: 'Families & caregivers', text: 'Households planning school runs, play time and cleaner indoor air.' },
  { icon: '🚇', title: 'Daily commuters', text: 'People balancing work schedules with lower exposure routes and travel options.' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, onStartPlan }) => (
  <div className="landing-page new-home">
    <header className="landing-nav" role="banner">
      <a className="landing-brand" href="#home"><span className="landing-brand-mark" aria-hidden="true">◒</span><span><strong>VaayuDootha</strong><small>Urban air decisions, made human</small></span></a>
      <nav className="landing-nav-links" aria-label="Main navigation"><a href="#who">Why VaayuDootha</a><a href="#workflow">How it works</a><button className="landing-signin-link" onClick={onSignIn}>Login</button></nav>
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
      <section className="new-home-intro" id="who"><div><p className="landing-kicker dark-kicker">MADE FOR YOUR KIND OF DAY</p><h2>Different lives.<br/>Different air decisions.</h2></div><p>One AQI reading does not affect every person or routine in the same way. Start with the people and plans that matter to you.</p></section>
      <section className="new-home-audiences" aria-label="Who VaayuDootha helps">{audiences.map((item, i) => <article className={`new-audience-card audience-${i+1}`} key={item.title}><div className="new-audience-image"><span>{item.icon}</span><small>VAAYUDOOTHA · EVERYDAY AIR GUIDE</small></div><div className="new-audience-copy"><span className="new-card-number">0{i+1}</span><h3>{item.title}</h3><p>{item.text}</p><a href="#workflow">Explore your plan <span>↗</span></a></div></article>)}</section>
      <section className="new-home-workflow" id="workflow"><div className="new-workflow-heading"><p className="landing-kicker">A SIMPLE DAILY CHECK-IN</p><h2>From local conditions<br/>to your next move.</h2><p>Share only the context needed to make a useful daily plan. Then ask follow-up questions and adjust the plan together.</p><button className="landing-primary-button" onClick={onStartPlan}>Set up my air plan <span>↗</span></button></div><div className="new-flow-steps"><article><span className="new-step-icon">01</span><div><h3>Your personal context</h3><p>Location, health sensitivities, outdoor habits and preferred activities.</p></div><span className="new-step-visual">⌖</span></article><article><span className="new-step-icon">02</span><div><h3>Your workday</h3><p>Work location, hours, commute and the days you need to be there.</p></div><span className="new-step-visual">▤</span></article><article><span className="new-step-icon">03</span><div><h3>A practical air plan</h3><p>Weather and AQI inform tailored actions, timing and safer alternatives.</p></div><span className="new-step-visual">✳</span></article><article><span className="new-step-icon">04</span><div><h3>Keep thinking together</h3><p>Chat with the assistant, explore trade-offs and choose reminders.</p></div><span className="new-step-visual">↗</span></article></div></section>
      <section className="new-terms"><p className="landing-kicker dark-kicker">A QUICK AIR GUIDE</p><h2>Know the words behind the plan.</h2><div className="new-term-grid"><article><b>AQI</b><p>An index describing how polluted the air is and what that may mean for daily activities.</p></article><article><b>PM2.5</b><p>Tiny airborne particles that can travel deep into the respiratory system.</p></article><article><b>Inversion</b><p>A weather pattern that can hold cooler, polluted air close to the ground.</p></article></div></section>
      <section className="new-home-cta"><div><p className="landing-kicker">START WITH YOUR REAL DAY</p><h2>Your routine is the right place to begin.</h2><p>Build your context first. VaayuDootha can turn it into a plan you can question and refine.</p></div><button className="landing-primary-button" onClick={onStartPlan}>Build my daily plan <span>↗</span></button></section>
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
