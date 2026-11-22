import { describe, expect, it } from 'vitest';
import { isInScope } from '../domain/scope';

describe('assistant topic boundary', () => {
  it('allows air and daily-plan questions and related follow-ups', () => {
    expect(isInScope('What should I do today?')).toBe(true);
    expect(isInScope('Can I run outside in this pollution?')).toBe(true);
    expect(isInScope('What about tomorrow?', [{question:'How is the air today?',answer:'Check the forecast.'}])).toBe(true);
  });
  it('redirects unrelated requests without related conversation', () => {
    expect(isInScope('Write a birthday poem about a pirate')).toBe(false);
    expect(isInScope('Build a cryptocurrency trading bot')).toBe(false);
  });
});
