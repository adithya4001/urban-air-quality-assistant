import type { AssistantReply } from './assistant';

// Limited emergency phrases; this is not diagnosis or a comprehensive triage system.
export function urgentSafetyReply(question: string): AssistantReply | null {
  const q = question.toLowerCase();
  const breathingOrChestConcern = /(?:severe|serious|cannot|can't|unable to|struggling to|hard to).{0,35}(?:breath|breathe)|(?:breath|breathing).{0,35}(?:severe|serious|can't|cannot)|(?:chest pain|pain in (?:my |the )?chest)/i.test(q);
  const generalDefinitionQuestion = /(?:what does|meaning of|define|definition|phrase).{0,40}(?:chest pain|pain in (?:my |the )?chest)/i.test(q);
  const otherUrgentSign = /blue (?:or grey |or gray )?lips|(?:sudden )?confusion|unconscious|faint(?:ing|ed)?|coughing (?:up )?blood|(?:suicid|kill myself|end my life|hurt myself)/i.test(q);
  const english = (breathingOrChestConcern && !generalDefinitionQuestion) || otherUrgentSign;
  const hindi = /(?:(?:सांस|साँस|श्वास).{0,35}(?:कठिन|तकलीफ|तकलीफ़|नहीं ले पा)|(?:सीने|छाती).{0,25}दर्द|नीले होंठ|बेहोश|खून की खांसी|खुदकुशी|आत्महत्या)/.test(q);
  const telugu = /(?:(?:ఊపిరి|శ్వాస).{0,35}(?:ఇబ్బంది|కష్టం|తీసుకోలేక)|(?:ఛాతి|గుండె).{0,25}నొప్పి|నీలి పెదవులు|స్పృహ తప్ప|రక్తం దగ్గు|ఆత్మహత్య|చేసుకోవాలని)/.test(q);
  if (!english && !hindi && !telugu) return null;
  const answer = hindi
    ? 'तुरंत स्थानीय आपातकालीन सेवाओं को कॉल करें या तत्काल चिकित्सा सहायता लें। खुद गाड़ी न चलाएं।'
    : telugu
      ? 'వెంటనే స్థానిక అత్యవసర సేవలకు కాల్ చేయండి లేదా అత్యవసర వైద్య సహాయం పొందండి. మీరే వాహనం నడపవద్దు.'
      : 'Call your local emergency services now or seek immediate emergency medical help. Do not drive yourself.';
  return { intent: 'today', answer, keyActions: [], whyItMatters: '', safetyNote: 'Do not wait for an air-quality forecast or a chat response before seeking help.', sourceGuidance: 'Emergency guidance: NHS shortness of breath and chest pain guidance.', source: 'safety' };
}
