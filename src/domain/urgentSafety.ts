import type { AssistantReply } from './assistant';

// Limited emergency phrases; this is not diagnosis or a comprehensive triage system.
export function urgentSafetyReply(question: string): AssistantReply | null {
  const q = question.toLowerCase();
  const english = /(?:severe|serious|cannot|can't|unable to|struggling to|hard to).{0,35}(?:breath|breathe)|(?:breath|breathing).{0,35}(?:severe|serious|can't|cannot)|(?:chest pain|pain in (?:my |the )?chest).{0,60}(?:breath|breathing)|(?:breath|breathing).{0,60}(?:chest pain|pain in (?:my |the )?chest)/i.test(q);
  const hindi = /(?:सांस|साँस|श्वास)/.test(q) && /(?:सीने|छाती)/.test(q) && /(?:दर्द|तकलीफ|तकलीफ़|कठिन)/.test(q);
  const telugu = /(?:ఊపిరి|శ్వాస)/.test(q) && /(?:ఛాతి|గుండె)/.test(q) && /(?:నొప్పి|ఇబ్బంది)/.test(q);
  if (!english && !hindi && !telugu) return null;
  const answer = hindi
    ? 'तुरंत स्थानीय आपातकालीन सेवाओं को कॉल करें या तत्काल चिकित्सा सहायता लें। खुद गाड़ी न चलाएं।'
    : telugu
      ? 'వెంటనే స్థానిక అత్యవసర సేవలకు కాల్ చేయండి లేదా అత్యవసర వైద్య సహాయం పొందండి. మీరే వాహనం నడపవద్దు.'
      : 'Call your local emergency services now or seek immediate emergency medical help. Do not drive yourself.';
  return { intent: 'today', answer, keyActions: [], whyItMatters: '', safetyNote: 'Do not wait for an air-quality forecast or a chat response before seeking help.', sourceGuidance: 'Emergency guidance: NHS shortness of breath and chest pain guidance.', source: 'safety' };
}
