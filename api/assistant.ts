import { AssistantContext, AssistantReply, buildAssistantReply } from '../src/domain/assistant';

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

    const baseline = buildAssistantReply(candidate.question, candidate.context);
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
