import React, { useState } from 'react';

const urgent = /chest (pain|pressure|tightness)|can't breathe|cannot breathe|severe (breath|breathing)|gasping|blue lips|confus|unconscious|faint|coughing (up )?blood/i;
export function PrecautionCenter() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const ask = (event: React.FormEvent) => {
    event.preventDefault();
    const text = question.trim(); if (!text) return;
    if (urgent.test(text)) setAnswer('These symptoms can be serious. Seek urgent medical help now or call your local emergency number. Do not drive yourself. If you have an existing emergency action plan, follow it while help is arranged.');
    else if (/asthma|copd|inhaler|wheez/i.test(text)) setAnswer('Cold air and pollution can aggravate breathing symptoms. Reduce exposure, move to a cleaner indoor space, and follow the treatment or action plan your clinician gave you. Contact a healthcare professional about new, worsening, or persistent symptoms.');
    else if (/cough|fever|sick|cold|throat|breath/i.test(text)) setAnswer('Symptoms can have many causes, so this tool cannot tell what is causing yours. Consider speaking to a healthcare professional, especially if symptoms are new, getting worse, or persistent. Reduce exposure to smoke and poor outdoor air while you seek advice.');
    else setAnswer('For winter air, check local conditions before prolonged outdoor activity, reduce exposure to smoke, and follow any existing care plan. A healthcare professional can help with questions about your symptoms, conditions, or treatment.');
  };
  return <section className="precaution-screen"><div className="precaution-screen-head"><p className="daily-eyebrow">PRECAUTION CENTRE</p><h2>Take care, one question at a time.</h2><p>Ask about winter air, common symptoms, and practical precautions.</p></div><div className="precaution-alert"><strong>Need urgent help?</strong> Severe breathing difficulty, chest pain, blue or grey lips, or sudden confusion can be an emergency. Call your local emergency number immediately.</div><div className="precaution-bot"><h3>Health guidance assistant</h3><p>This early version provides limited, rule-based guidance. It cannot diagnose illness, assess your condition, or prescribe treatment.</p><form onSubmit={ask}><label htmlFor="health-question">What would you like to ask?</label><textarea id="health-question" value={question} onChange={e=>setQuestion(e.target.value)} placeholder="For example: How can I reduce exposure when the air is poor?" maxLength={500} rows={3}/><button className="primary-button" type="submit">Get guidance</button></form>{answer && <div className="precaution-answer" role="status"><strong>Guidance</strong><p>{answer}</p></div>}<p className="precaution-sources">Learn more: <a href="https://www.nhs.uk/symptoms/shortness-of-breath/" target="_blank" rel="noreferrer">NHS breathing guidance</a> · <a href="https://www.airnow.gov/aqi/aqi-basics/" target="_blank" rel="noreferrer">AirNow AQI basics</a></p></div></section>;
}
