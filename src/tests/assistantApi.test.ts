import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/backend', () => ({ verifyToken: vi.fn().mockResolvedValue({ sub: 'user_test' }) }));
import assistant from '../../api/assistant';
import { generateDailyPlan } from '../domain/recommendationEngine';
import { MOCK_AIR_QUALITY_MAP, MOCK_LOCATIONS, MOCK_WEATHER_MAP } from '../services/mockData';
import type { UserProfile } from '../domain/types';

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('assistant API', () => {
  it('rejects unauthenticated requests', async () => {
    vi.stubEnv('CLERK_SECRET_KEY', 'test-secret');
    const response = await assistant.fetch(new Request('http://localhost/api/assistant', { method: 'POST' }));
    expect(response.status).toBe(401);
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
    expect((await response.json()).answer).toBe('Consider an indoor walk.');
    expect(fetchMock.mock.calls[0][0]).toContain('generativelanguage.googleapis.com');
  });
});
