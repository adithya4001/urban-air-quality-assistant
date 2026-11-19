import { describe, expect, it } from 'vitest';
import { buildAssistantReply, classifyAssistantIntent } from '../domain/assistant';
import { generateDailyPlan } from '../domain/recommendationEngine';
import { MOCK_AIR_QUALITY_MAP, MOCK_LOCATIONS, MOCK_WEATHER_MAP } from '../services/mockData';
import { UserProfile } from '../domain/types';

const profile: UserProfile = {
  id: 'test-user',
  name: 'Test resident',
  ageGroup: 'teen_adult',
  healthConditions: ['none'],
  lifestyle: {
    commuteMode: 'transit',
    commuteDurationMinutes: 30,
    outdoorActivityLevel: 'moderate',
    homeHeatingType: 'electric_heatpump',
  },
  hasAirPurifier: true,
  hasN95Masks: true,
};

function contextForDelhi() {
  const location = MOCK_LOCATIONS[0];
  const plan = generateDailyPlan(location, profile, MOCK_AIR_QUALITY_MAP[location.id], MOCK_WEATHER_MAP[location.id]);
  return { profile, airQuality: plan.airQuality, weather: plan.weather, plan };
}

describe('Explainable assistant fallback', () => {
  it('routes common resident questions to stable intents', () => {
    expect(classifyAssistantIntent('How do I protect indoor air?')).toBe('indoor');
    expect(classifyAssistantIntent('Can I cycle to work?')).toBe('commute');
    expect(classifyAssistantIntent('What about my child?')).toBe('family');
    expect(classifyAssistantIntent('What should I do today?')).toBe('today');
  });

  it('answers from the deterministic plan rather than inventing a new risk', () => {
    const reply = buildAssistantReply('Should I exercise outside?', contextForDelhi());
    expect(reply.intent).toBe('outdoor');
    expect(reply.answer).toContain('AQI 388');
    expect(reply.keyActions.length).toBeGreaterThan(0);
    expect(reply.safetyNote).toContain('breathing difficulty');
  });

  it('keeps safety boundaries visible for family questions', () => {
    const context = contextForDelhi();
    const reply = buildAssistantReply('How should I protect my family?', {
      ...context,
      profile: { ...profile, ageGroup: 'infant_child', healthConditions: ['asthma'] },
    });
    expect(reply.intent).toBe('family');
    expect(reply.safetyNote).toContain('does not diagnose');
  });
});

