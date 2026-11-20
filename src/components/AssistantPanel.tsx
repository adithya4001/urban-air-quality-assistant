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
  const [question, setQuestion] = useState('');
  const [turns, setTurns] = useState<Array<{ question: string; reply: AssistantReply }>>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);
  const provider = useMemo(() => createAssistantProvider(), []);

  const ask = async (value = question) => {
    const trimmed = value.trim();
    if (!trimmed || isAsking) return;
    setQuestion('');
    setIsAsking(true);
    setProviderError(null);
    try {
      const reply = await provider.ask(trimmed, context);
      setTurns((previous) => [...previous, { question: trimmed, reply }]);
    } catch {
      setProviderError('The assistant could not answer right now. Open Action plan for your recommendations.');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <section className="assistant-panel card" aria-labelledby="assistant-title">
      <div className="assistant-heading">
        <div>
          <h2 id="assistant-title" className="card-title">Ask BreatheSafe</h2>
          <p className="section-copy">Ask about exercise, commuting, or the air inside your home.</p>
        </div>
      </div>

      <div className="quick-question-list" aria-label="Suggested questions">
        {quickQuestions.map((item) => (
          <button key={item} type="button" className="chip-button" disabled={isAsking} onClick={() => ask(item)}>
            {item}
          </button>
        ))}
      </div>

      <div className="conversation" role="log" aria-label="Conversation">
      {turns.map(({ question: asked, reply }, index) => (
        <div className="conversation-turn" key={index}>
          <p className="question-bubble">{asked}</p>
          <div className="assistant-answer">
            <span className="reply-source">{reply.source === 'genai' ? 'GenAI explanation' : 'Rule-based guidance'}</span>
            <p className="answer-lead">{reply.answer}</p>
            <div className="answer-grid">
              <div><h3>Do this next</h3><ul>{reply.keyActions.map((action) => <li key={action}>{action}</li>)}</ul></div>
              <div><h3>Why it matters</h3><p>{reply.whyItMatters}</p></div>
            </div>
            <p className="safety-note">{reply.safetyNote}</p>
            <p className="source-note">{reply.sourceGuidance}</p>
          </div>
        </div>
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
          maxLength={500}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="e.g. Can my child play outside after school?"
        />
        <button className="primary-button" type="submit" disabled={isAsking || !question.trim()}>
          {isAsking ? 'Thinking…' : 'Guide me'}
        </button>
      </form>

      {providerError && <p className="assistant-error" role="alert">{providerError}</p>}

    </section>
  );
};

