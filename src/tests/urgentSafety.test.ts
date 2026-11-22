import { describe, expect, it } from 'vitest';
import { urgentSafetyReply } from '../domain/urgentSafety';

describe('urgent safety response', () => {
  it.each([
    'I have severe trouble breathing and chest pain',
    'I am coughing blood and feel faint',
    'मुझे सांस लेने में बहुत तकलीफ़ है और सीने में दर्द है',
    'छाती में दर्द हो रहा है',
    'ఊపిరి తీసుకోవడం ఇబ్బంది మరియు ఛాతి నొప్పి',
    'ఛాతి నొప్పి వస్తోంది',
  ])('prioritizes immediate help for %s', (question) => {
    expect(urgentSafetyReply(question)?.source).toBe('safety');
  });
  it('does not flag an ordinary jogging question', () => {
    expect(urgentSafetyReply('Can I go for a jog tomorrow?')).toBeNull();
  });

  it('does not escalate a general question that only mentions chest pain', () => {
    expect(urgentSafetyReply('What does the phrase chest pain mean in an AQI article?')).toBeNull();
  });
});
