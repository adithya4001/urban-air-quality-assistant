import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/backend', () => ({ verifyToken: vi.fn().mockResolvedValue({ sub: 'user_test' }) }));
import assistant from '../../api/assistant';
import { generateDailyPlan } from '../domain/recommendationEngine';
import { MOCK_AIR_QUALITY_MAP, MOCK_LOCATIONS, MOCK_WEATHER_MAP } from '../services/mockData';
import type { UserProfile } from '../domain/types';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('assistant API', () => {
  it('rejects unauthenticated requests', async () => {
    vi.stubEnv('CLERK_SECRET_KEY', 'test-secret');
    const response = await assistant.fetch(new Request('http://localhost/api/assistant', { method: 'POST' }));
    expect(response.status).toBe(401);
  });

  it('rejects malformed contexts and oversized requests', async () => {
    vi.stubEnv('CLERK_SECRET_KEY', 'test-secret');
    const headers = { Authorization: 'Bearer session', 'Content-Type': 'application/json' };
    const malformed = await assistant.fetch(new Request('http://localhost/api/assistant', { method: 'POST', headers, body: JSON.stringify({ question: 'How is the air?', context: { profile: {}, airQuality: {}, weather: {}, plan: {} } }) }));
    expect(malformed.status).toBe(400);

    const location = MOCK_LOCATIONS[0];
    const profile: UserProfile = { id: 'test', name: 'Test', ageGroup: 'teen_adult', healthConditions: ['none'], lifestyle: { commuteMode: 'transit', commuteDurationMinutes: 20, outdoorActivityLevel: 'moderate', homeHeatingType: 'electric_heatpump' }, hasAirPurifier: false, hasN95Masks: false };
    const plan = generateDailyPlan(location, profile, MOCK_AIR_QUALITY_MAP[location.id], MOCK_WEATHER_MAP[location.id]);
    const invalidContext = { profile, plan, weather: plan.weather, airQuality: { ...plan.airQuality, aqi: 100000 } };
    const outOfRange = await assistant.fetch(new Request('http://localhost/api/assistant', { method: 'POST', headers, body: JSON.stringify({ question: 'How is the air?', context: invalidContext }) }));
    expect(outOfRange.status).toBe(400);

    const oversized = await assistant.fetch(new Request('http://localhost/api/assistant', { method: 'POST', headers, body: JSON.stringify({ question: 'air', padding: 'x'.repeat(66000) }) }));
    expect(oversized.status).toBe(413);
  });

  it('uses the server-side Gemini key and returns its explanation', async () => {
    vi.stubEnv('CLERK_SECRET_KEY', 'test-secret');
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ answer: 'Consider an indoor walk.', whyItMatters: 'This can reduce exposure.' }) } }] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const profile: UserProfile = { id: 'test', name: 'Test', ageGroup: 'teen_adult', healthConditions: ['none'], lifestyle: { commuteMode: 'transit', commuteDurationMinutes: 20, outdoorActivityLevel: 'moderate', homeHeatingType: 'electric_heatpump' }, hasAirPurifier: false, hasN95Masks: false };
    const location = MOCK_LOCATIONS[0];
    const plan = generateDailyPlan(location, profile, MOCK_AIR_QUALITY_MAP[location.id], MOCK_WEATHER_MAP[location.id]);
    const response = await assistant.fetch(new Request('http://localhost/api/assistant', { method: 'POST', headers: { Authorization: 'Bearer session', 'Content-Type': 'application/json' }, body: JSON.stringify({ question: 'Can I walk outside today?', context: { profile, plan, weather: plan.weather, airQuality: plan.airQuality } }) }));
    expect(response.headers.get('X-BreatheSafe-Source')).toBe('ai-gateway-with-deterministic-guardrails');
    const reply = await response.json();
    expect(reply.answer).toBe('Consider an indoor walk.');
    expect(reply.keyActions.length).toBeGreaterThan(0);
    expect(fetchMock.mock.calls[0][0]).toContain('generativelanguage.googleapis.com');
    const sentRequest = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    const sentContext = JSON.parse(sentRequest.messages[1].content).verifiedPlan;
    expect(sentContext.location).toEqual({ city: location.city, country: location.country });
    expect(sentContext.residentContext.ageGroup).toBe('teen_adult');
    expect(sentContext.residentContext.lifestyle.commuteMode).toBe('transit');
    expect(sentContext.residentContext).not.toHaveProperty('name');
    expect(sentContext.location).not.toHaveProperty('coordinates');
  });

  it('enforces the VaayuDootha topic boundary on the server', async () => {
    vi.stubEnv('CLERK_SECRET_KEY', 'test-secret');
    const response = await assistant.fetch(new Request('http://localhost/api/assistant', {
      method: 'POST',
      headers: { Authorization: 'Bearer session', 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Write a poem about rainbows.' }),
    }));
    expect(response.status).toBe(200);
    expect(response.headers.get('X-BreatheSafe-Source')).toBe('scope');
    expect((await response.json()).source).toBe('scope');
  });

  it('falls back to deterministic guidance if the model returns clinical instructions', async () => {
    vi.stubEnv('CLERK_SECRET_KEY', 'test-secret');
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ answer: 'You have pneumonia. Take 500 mg antibiotic.', whyItMatters: 'This will cure you.' }) } }] }), { status: 200 })));
    const profile: UserProfile = { id: 'test', name: 'Test', ageGroup: 'teen_adult', healthConditions: ['none'], lifestyle: { commuteMode: 'transit', commuteDurationMinutes: 20, outdoorActivityLevel: 'moderate', homeHeatingType: 'electric_heatpump' }, hasAirPurifier: false, hasN95Masks: false };
    const location = MOCK_LOCATIONS[0];
    const plan = generateDailyPlan(location, profile, MOCK_AIR_QUALITY_MAP[location.id], MOCK_WEATHER_MAP[location.id]);
    const response = await assistant.fetch(new Request('http://localhost/api/assistant', {
      method: 'POST',
      headers: { Authorization: 'Bearer session', 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Can I walk outside today?', context: { profile, plan, weather: plan.weather, airQuality: plan.airQuality } }),
    }));
    expect(response.headers.get('X-BreatheSafe-Source')).toBe('deterministic-safety-fallback');
    const reply = await response.json();
    expect(reply.answer).not.toContain('pneumonia');
    expect(reply.keyActions.length).toBeGreaterThan(0);
  });
});
