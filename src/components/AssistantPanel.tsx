import React, { useMemo, useState } from 'react';
import { AssistantContext, AssistantReply } from '../domain/assistant';
import { createAssistantProvider } from '../services/AssistantService';

interface AssistantPanelProps {
  context: AssistantContext;
}

const quickQuestions = [
  'What should I do today?',
  'How can I protect indoor air?',
  'Is it safe to exercise outside?',
  'What is the lowest-emission commute?',
];

export const AssistantPanel: React.FC<AssistantPanelProps> = ({ context }) => {
  const [question, setQuestion] = useState('What should I do today?');
  const [reply, setReply] = useState<AssistantReply | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);
  const provider = useMemo(() => createAssistantProvider(), []);

  const ask = async (value = question) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setQuestion(trimmed);
    setIsAsking(true);
    setProviderError(null);
    try {
      setReply(await provider.ask(trimmed, context));
    } catch {
      setProviderError('The assistant could not answer right now. Use the action cards below as the verified safety baseline.');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <section className="assistant-panel card" aria-labelledby="assistant-title">
      <div className="assistant-heading">
        <div>
          <p className="eyebrow">PERSONALIZED GUIDE</p>
          <h2 id="assistant-title" className="card-title">Ask BreatheSafe</h2>
          <p className="section-copy">Get a clear next step based on the selected place, conditions, and resident profile.</p>
        </div>
        <span className="model-chip" title="Model credentials stay server-side; deterministic guidance remains available offline">
          <span className="status-dot" aria-hidden="true" /> {provider.providerName}
        </span>
      </div>

      <div className="quick-question-list" aria-label="Suggested questions">
        {quickQuestions.map((item) => (
          <button key={item} type="button" className="chip-button" onClick={() => ask(item)}>
            {item}
          </button>
        ))}
      </div>

      <form
        className="assistant-form"
        onSubmit={(event) => {
          event.preventDefault();
          void ask();
        }}
      >
        <label className="sr-only" htmlFor="assistant-question">Ask a question about today’s air</label>
        <input
          id="assistant-question"
          className="form-input assistant-input"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="e.g. Can my child play outside after school?"
        />
        <button className="primary-button" type="submit" disabled={isAsking || !question.trim()}>
          {isAsking ? 'Thinking…' : 'Guide me'}
        </button>
      </form>

      {providerError && <p className="assistant-error" role="alert">{providerError}</p>}

      {reply && (
        <div className="assistant-answer" role="status" aria-live="polite">
          <div className="answer-lead">
            <span className="answer-icon" aria-hidden="true">✦</span>
            <p>{reply.answer}</p>
          </div>
          <div className="answer-grid">
            <div>
              <h3>Do this next</h3>
              <ul>
                {reply.keyActions.map((action) => <li key={action}>{action}</li>)}
              </ul>
            </div>
            <div>
              <h3>Why it matters</h3>
              <p>{reply.whyItMatters}</p>
            </div>
          </div>
          <p className="safety-note"><strong>Safety boundary:</strong> {reply.safetyNote}</p>
          <p className="source-note">Guidance basis: {reply.sourceGuidance}</p>
        </div>
      )}
    </section>
  );
};

