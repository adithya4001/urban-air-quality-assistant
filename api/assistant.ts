import type { AssistantContext, AssistantReply, AssistantIntent } from '../src/domain/assistant';

const GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';

type RuntimeEnv = Record<string, string | undefined>;

function getRuntimeEnv(): RuntimeEnv {
  return (globalThis as typeof globalThis & {
    process?: { env?: RuntimeEnv };
  }).process?.env ?? {};
}

function json(data: unknown, status = 200, source = 'deterministic-safety-fallback') {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-BreatheSafe-Source': source,
    },
  });
}

function isContext(value: unknown): value is AssistantContext {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AssistantContext>;
  return Boolean(candidate.profile && candidate.airQuality && candidate.weather && candidate.plan);
}

function isExplanation(value: unknown): value is Pick<AssistantReply, 'answer' | 'whyItMatters'> {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AssistantReply>;
  return typeof candidate.answer === 'string'
    && candidate.answer.length > 0
    && candidate.answer.length <= 700
    && typeof candidate.whyItMatters === 'string'
    && candidate.whyItMatters.length > 0
    && candidate.whyItMatters.length <= 900;
}

function classifyIntent(question: string): AssistantIntent {
  const normalized = question.toLowerCase();
  if (/indoor|home|room|purifier|window/.test(normalized)) return 'indoor';
  if (/commute|travel|office|school|walk|cycle/.test(normalized)) return 'commute';
  if (/child|children|family|elder|baby|pregnan/.test(normalized)) return 'family';
  if (/impact|why|co2|environment|pollution/.test(normalized)) return 'impact';
  if (/outside|outdoor|exercise|run|mask/.test(normalized)) return 'outdoor';
  return 'today';
}

function deterministicReply(question: string, context: AssistantContext): AssistantReply {
  const intent = classifyIntent(question);
  const recommendationFor = (category: string) => context.plan.recommendations.find((item) => item.category === category);
  const recommendation = recommendationFor(
    intent === 'indoor' ? 'indoor_air'
      : intent === 'commute' ? 'commute'
        : intent === 'impact' ? 'emission_reduction'
          : 'outdoor_activity',
  );
  const sensitive = context.profile.ageGroup !== 'teen_adult'
    || context.profile.healthConditions.some((condition) => condition !== 'none');
  const safetyNote = sensitive
    ? 'Use the cautious option for this profile and follow the person’s clinician guidance. This assistant does not diagnose or change treatment.'
    : 'If breathing difficulty, chest pain, confusion, or severe symptoms occur, move to cleaner air and seek urgent local medical help.';
  const actions = recommendation?.actionItems.slice(0, 4)
    ?? ['Protect indoor air during peak smog.', 'Reduce unnecessary outdoor exposure.', 'Choose a lower-emission practical routine.'];

  if (intent === 'family') {
    return {
      intent,
      answer: 'For children, older adults, pregnancy, asthma, COPD, and cardiovascular sensitivity, choose the conservative exposure plan.',
      keyActions: [
        'Move exercise and play indoors when risk is unhealthy for sensitive groups or worse.',
        'Plan short, necessary trips outside the peak smog window.',
        'Keep prescribed medicines available according to the person’s existing care plan.',
      ],
      whyItMatters: 'Sensitive people can experience effects at lower pollution levels, so the household plan should follow its most sensitive member.',
      safetyNote: 'This assistant does not diagnose or change treatment. Use clinician instructions and local emergency services for acute symptoms.',
      sourceGuidance: 'EPA AQI sensitive-group guidance and local public-health advice',
    };
  }

  return {
    intent,
    answer: intent === 'today'
      ? `Today’s plan for ${context.plan.location.city}: protect indoor air, reduce peak exposure, and choose the lowest-emission practical routine.`
      : `For ${context.plan.location.city}, follow the verified ${intent} actions below while the effective risk is ${context.plan.overallRisk.replace('_', ' ')}.`,
    keyActions: actions,
    whyItMatters: `This guidance uses AQI ${Math.round(context.airQuality.aqi)}, ${context.weather.temperatureC}°C weather, ${context.weather.windSpeedKmh} km/h wind, and the resident profile.`,
    safetyNote,
    sourceGuidance: recommendation?.sourceGuidance ?? 'Deterministic local safety fallback; replace with verified live provider data in production',
  };
}

function safeContext(context: AssistantContext) {
  return {
    location: context.plan.location,
    profile: {
      ageGroup: context.profile.ageGroup,
      healthConditions: context.profile.healthConditions,
      lifestyle: context.profile.lifestyle,
      hasAirPurifier: context.profile.hasAirPurifier,
      hasN95Masks: context.profile.hasN95Masks,
    },
    airQuality: context.airQuality,
    weather: context.weather,
    overallRisk: context.plan.overallRisk,
    recommendations: context.plan.recommendations.map((recommendation) => ({
      category: recommendation.category,
      title: recommendation.title,
      summary: recommendation.summary,
      actionItems: recommendation.actionItems,
      priority: recommendation.priority,
      safetyNotice: recommendation.safetyNotice,
      sourceGuidance: recommendation.sourceGuidance,
    })),
  };
}

async function explainWithGateway(question: string, context: AssistantContext, token: string, model: string) {
  const response = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 450,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'breathesafe_explanation',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              answer: { type: 'string' },
              whyItMatters: { type: 'string' },
            },
            required: ['answer', 'whyItMatters'],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: 'system',
          content: [
            'You are the explanation layer for BreatheSafe, an urban winter air-quality assistant.',
            'The deterministic plan is authoritative. Explain it in plain language; never replace, add, or weaken its actions.',
            'Do not diagnose, prescribe, change medication, or invent pollutant readings, weather, sources, or medical claims.',
            'Do not recommend strenuous outdoor activity when the plan marks the risk unhealthy or worse.',
            'Mention urgent local medical help only for severe symptoms such as breathing difficulty or chest pain.',
            'Return only the requested JSON object. Keep the answer concise and practical.',
          ].join(' '),
        },
        {
          role: 'user',
          content: JSON.stringify({ question, verifiedPlan: safeContext(context) }),
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`AI Gateway returned ${response.status}`);
  const payload = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI Gateway returned no explanation');
  const parsed: unknown = JSON.parse(content);
  if (!isExplanation(parsed)) throw new Error('AI Gateway returned an invalid explanation');
  return parsed;
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Request body must be valid JSON' }, 400);
    }

    const candidate = body as { question?: unknown; context?: unknown };
    if (typeof candidate.question !== 'string' || candidate.question.trim().length === 0 || candidate.question.length > 500) {
      return json({ error: 'Question must be a non-empty string of at most 500 characters' }, 400);
    }
    if (!isContext(candidate.context)) return json({ error: 'A valid assistant context is required' }, 400);

    const baseline = deterministicReply(candidate.question, candidate.context);
    const env = getRuntimeEnv();
    const token = env.AI_GATEWAY_API_KEY || env.VERCEL_OIDC_TOKEN;
    if (!token) return json(baseline);

    try {
      const explanation = await explainWithGateway(
        candidate.question,
        candidate.context,
        token,
        env.AI_GATEWAY_MODEL || 'google/gemini-3.8-flash',
      );
      return json(
        { ...baseline, answer: explanation.answer, whyItMatters: explanation.whyItMatters },
        200,
        'ai-gateway-with-deterministic-guardrails',
      );
    } catch (error) {
      console.error('AI Gateway explanation failed; serving deterministic baseline', error);
      return json(baseline);
    }
  },
};
