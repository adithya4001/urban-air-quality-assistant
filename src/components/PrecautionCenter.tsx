import React, { useMemo, useState } from 'react';
import { useAuth } from '@clerk/react';
import type { AssistantContext, AssistantReply } from '../domain/assistant';
import { createAssistantProvider } from '../services/AssistantService';

const urgent = /chest (pain|pressure|tightness)|can't breathe|cannot breathe|severe (breath|breathing)|gasping|blue lips|confus|unconscious|faint|coughing (up )?blood|(?:suicid|kill myself|end my life|hurt myself)/i;
type HealthTurn = { question: string; reply: AssistantReply };
const emergencyReply: AssistantReply = { intent: 'today', source: 'safety', answer: 'These symptoms or feelings may need immediate help. Contact local emergency services now or ask someone nearby to help you reach urgent care. Do not drive yourself.', keyActions: [], whyItMatters: '', safetyNote: 'Do not wait for an air-quality forecast or a chat reply before seeking help.', sourceGuidance: 'Urgent safety guidance' };

export function PrecautionCenter({ context }: { context: AssistantContext | null }) {
  const { getToken } = useAuth(); const provider = useMemo(() => createAssistantProvider(getToken), [getToken]);
  const [question, setQuestion] = useState(''); const [turns, setTurns] = useState<HealthTurn[]>([]); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const ask = async (event: React.FormEvent) => {
    event.preventDefault(); const text = question.trim(); if (!text || busy) return;
    setQuestion(''); setError(''); setBusy(true);
    try {
      const history = turns.slice(-6).map(t => ({ question: t.question, answer: t.reply.answer }));
      const reply = urgent.test(text) ? emergencyReply : context ? await provider.ask(text, context, history) : null;
      if (!reply) { setError('Air context is still loading. Please try again.'); return; }
      setTurns(previous => [...previous, { question: text, reply }]);
    } catch { setError('Guidance is unavailable right now. Please try again or contact a healthcare professional.'); }
    finally { setBusy(false); }
  };
  return <section className="precaution-screen"><div className="precaution-screen-head"><p className="daily-eyebrow">PRECAUTION CENTRE</p><h2>Take care, one question at a time.</h2><p>Ask about winter air, common symptoms, practical precautions, or worries about pollution.</p></div><div className="precaution-alert"><strong>Need urgent help?</strong> Severe breathing difficulty, chest pain, blue or grey lips, or sudden confusion can be an emergency. Call your local emergency number immediately.</div><div className="precaution-bot"><h3>Health guidance assistant</h3><p>Ask for general, supportive guidance. This assistant cannot diagnose illness or prescribe treatment. Your question is sent to the configured AI provider when AI is available.</p><div role="log" aria-live="polite">{turns.map((turn, index) => <div className="precaution-answer" key={index}><strong>You</strong><p>{turn.question}</p><strong>{turn.reply.source === 'genai' ? 'AI guidance' : turn.reply.source === 'safety' ? 'Urgent safety guidance' : 'Basic guidance · AI unavailable'}</strong><p>{turn.reply.answer}</p>{turn.reply.whyItMatters && <p>{turn.reply.whyItMatters}</p>}<small>{turn.reply.safetyNote}</small></div>)}</div><form onSubmit={event => void ask(event)}><label htmlFor="health-question">What would you like to ask?</label><textarea id="health-question" value={question} onChange={e => setQuestion(e.target.value)} placeholder="For example: How can I reduce exposure when the air is poor?" maxLength={500} rows={3}/><button className="primary-button" type="submit" disabled={busy || !question.trim()}>{busy ? 'Preparing guidance…' : 'Get guidance'}</button></form>{error && <p role="alert">{error}</p>}<p className="precaution-sources">Learn more: <a href="https://www.nhs.uk/symptoms/shortness-of-breath/" target="_blank" rel="noreferrer">NHS breathing guidance</a> · <a href="https://www.airnow.gov/aqi/aqi-basics/" target="_blank" rel="noreferrer">AirNow AQI basics</a></p></div></section>;
}
