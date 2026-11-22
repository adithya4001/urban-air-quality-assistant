import { AssistantContext, AssistantReply, buildAssistantReply } from '../domain/assistant';
import { isInScope, scopeReply } from '../domain/scope';
import { urgentSafetyReply } from '../domain/urgentSafety';

export interface IAssistantProvider {
  readonly providerName: string;
  ask(question: string, context: AssistantContext, history?: Array<{question:string;answer:string}>): Promise<AssistantReply>;
}

/**
 * Safe demo provider used until a server-side Gemini endpoint is configured.
 * Keeping this interface separate prevents API keys from reaching the browser
 * and guarantees useful behavior when a model or network is unavailable.
 */
export class DemoAssistantProvider implements IAssistantProvider {
  public readonly providerName = 'VaayuDootha deterministic safety fallback';

  public async ask(question: string, context: AssistantContext, history: Array<{question:string;answer:string}> = []): Promise<AssistantReply> {
    if (!isInScope(question, history)) return scopeReply();
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

  constructor(private readonly endpoint: string, private readonly getToken?: () => Promise<string | null>) {}

  public async ask(question: string, context: AssistantContext, history: Array<{question:string;answer:string}> = []): Promise<AssistantReply> {
    const token = await this.getToken?.();
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ question, context, history: history.slice(-6) }),
    });
    if (!response.ok) throw new Error(`Assistant endpoint returned ${response.status}`);
    const payload: unknown = await response.json();
    if (!isAssistantReply(payload)) throw new Error('Assistant endpoint returned an invalid reply');
    return {
      ...payload,
      source: response.headers.get('X-BreatheSafe-Source') === 'ai-gateway-with-deterministic-guardrails'
        ? 'genai'
        : response.headers.get('X-BreatheSafe-Source') === 'urgent-safety'
          ? 'safety'
          : response.headers.get('X-BreatheSafe-Source') === 'scope'
            ? 'scope'
            : 'rules',
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

  public async ask(question: string, context: AssistantContext, history: Array<{question:string;answer:string}> = []): Promise<AssistantReply> {
    const urgent = urgentSafetyReply(question);
    if (urgent) return urgent;
    try {
      return await this.primary.ask(question, context, history);
    } catch {
      return this.fallback.ask(question, context, history);
    }
  }
}

export function createAssistantProvider(getToken?: () => Promise<string | null>): IAssistantProvider {
  const endpoint = import.meta.env.VITE_ASSISTANT_ENDPOINT?.trim()
    || (import.meta.env.PROD ? '/api/assistant' : '');
  const fallback = new DemoAssistantProvider();
  return endpoint
    ? new FallbackAssistantProvider(new RemoteAssistantProvider(endpoint, getToken), fallback)
    : fallback;
}

