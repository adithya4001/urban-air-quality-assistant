import { describe, expect, it, vi } from 'vitest';
import { generateDailyPlan } from '../domain/recommendationEngine';
import {
  DemoAssistantProvider,
  FallbackAssistantProvider,
  RemoteAssistantProvider,
} from '../services/AssistantService';
import { MOCK_AIR_QUALITY_MAP, MOCK_LOCATIONS, MOCK_WEATHER_MAP } from '../services/mockData';
import { UserProfile } from '../domain/types';

const profile: UserProfile = {
  id: 'service-test-user',
  name: 'Service test resident',
  ageGroup: 'teen_adult',
  healthConditions: ['none'],
  lifestyle: {
    commuteMode: 'transit',
    commuteDurationMinutes: 25,
    outdoorActivityLevel: 'moderate',
    homeHeatingType: 'electric_heatpump',
  },
  hasAirPurifier: true,
  hasN95Masks: true,
};

function contextForTest() {
  const location = MOCK_LOCATIONS[0];
  const plan = generateDailyPlan(location, profile, MOCK_AIR_QUALITY_MAP[location.id], MOCK_WEATHER_MAP[location.id]);
  return { profile, airQuality: plan.airQuality, weather: plan.weather, plan };
}

describe('Assistant provider boundary', () => {
  it('falls back to deterministic guidance when the configured provider fails', async () => {
    const primary = {
      providerName: 'test remote',
      ask: vi.fn().mockRejectedValue(new Error('offline')),
    };
    const provider = new FallbackAssistantProvider(primary, new DemoAssistantProvider());

    const reply = await provider.ask('What should I do today?', contextForTest());

    expect(reply.intent).toBe('today');
    expect(reply.keyActions.length).toBeGreaterThan(0);
    expect(primary.ask).toHaveBeenCalledOnce();
  });

  it('rejects malformed remote replies instead of rendering untrusted shape', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ answer: 'missing required fields' }),
    }) as typeof fetch;

    await expect(new RemoteAssistantProvider('/api/assistant').ask('Hello', contextForTest()))
      .rejects.toThrow('invalid reply');

    globalThis.fetch = originalFetch;
  });
});
