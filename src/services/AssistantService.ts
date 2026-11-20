import { AssistantContext, AssistantReply, buildAssistantReply } from '../domain/assistant';

export interface IAssistantProvider {
  readonly providerName: string;
  ask(question: string, context: AssistantContext): Promise<AssistantReply>;
}

/**
 * Safe demo provider used until a server-side Gemini endpoint is configured.
 * Keeping this interface separate prevents API keys from reaching the browser
 * and guarantees useful behavior when a model or network is unavailable.
 */
export class DemoAssistantProvider implements IAssistantProvider {
  public readonly providerName = 'VaayuDootha deterministic safety fallback';

  public async ask(question: string, context: AssistantContext): Promise<AssistantReply> {
    return { ...buildAssistantReply(question, context), source: 'rules' };
  }
}

function isAssistantReply(value: unknown): value is AssistantReply {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AssistantReply>;
  return typeof candidate.answer === 'string'
    && Array.isArray(candidate.keyActions)
    && candidate.keyActions.every((item) => typeof item === 'string')
    && typeof candidate.whyItMatters === 'string'
    && typeof candidate.safetyNote === 'string'
    && typeof candidate.sourceGuidance === 'string';
}

/** Optional server-side provider; model credentials must never reach the browser. */
export class RemoteAssistantProvider implements IAssistantProvider {
  public readonly providerName = 'Server assistant with local safety fallback';

  constructor(private readonly endpoint: string) {}

  public async ask(question: string, context: AssistantContext): Promise<AssistantReply> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context }),
    });
    if (!response.ok) throw new Error(`Assistant endpoint returned ${response.status}`);
    const payload: unknown = await response.json();
    if (!isAssistantReply(payload)) throw new Error('Assistant endpoint returned an invalid reply');
    return {
      ...payload,
      source: response.headers.get('X-BreatheSafe-Source') === 'ai-gateway-with-deterministic-guardrails'
        ? 'genai' : 'rules',
    };
  }
}

/** Always preserves a deterministic answer when the remote service is unavailable. */
export class FallbackAssistantProvider implements IAssistantProvider {
  public readonly providerName = 'Configured assistant with deterministic fallback';

  constructor(
    private readonly primary: IAssistantProvider,
    private readonly fallback: IAssistantProvider,
  ) {}

  public async ask(question: string, context: AssistantContext): Promise<AssistantReply> {
    try {
      return await this.primary.ask(question, context);
    } catch {
      return this.fallback.ask(question, context);
    }
  }
}

export function createAssistantProvider(): IAssistantProvider {
  const endpoint = import.meta.env.VITE_ASSISTANT_ENDPOINT?.trim()
    || (import.meta.env.PROD ? '/api/assistant' : '');
  const fallback = new DemoAssistantProvider();
  return endpoint
    ? new FallbackAssistantProvider(new RemoteAssistantProvider(endpoint), fallback)
    : fallback;
}

