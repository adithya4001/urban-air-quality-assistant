import { describe, expect, it } from 'vitest';
import { urgentSafetyReply } from '../domain/urgentSafety';

describe('urgent safety response', () => {
  it.each([
    'I have severe trouble breathing and chest pain',
    'मुझे सांस लेने में बहुत तकलीफ़ है और सीने में दर्द है',
    'ఊపిరి తీసుకోవడం ఇబ్బంది మరియు ఛాతి నొప్పి',
  ])('prioritizes immediate help for %s', (question) => {
    expect(urgentSafetyReply(question)?.source).toBe('safety');
  });
  it('does not flag an ordinary jogging question', () => {
    expect(urgentSafetyReply('Can I go for a jog tomorrow?')).toBeNull();
  });
});
