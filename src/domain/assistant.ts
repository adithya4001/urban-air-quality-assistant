import {
  AirQualitySnapshot,
  DailyPlan,
  UserProfile,
  WeatherSnapshot,
} from './types';

export type AssistantIntent =
  | 'today'
  | 'outdoor'
  | 'indoor'
  | 'commute'
  | 'family'
  | 'impact';

export interface AssistantReply {
  source?: 'genai' | 'rules' | 'scope' | 'safety';
  intent: AssistantIntent;
  answer: string;
  keyActions: string[];
  whyItMatters: string;
  safetyNote: string;
  sourceGuidance: string;
}

export interface AssistantContext {
  profile: UserProfile;
  airQuality: AirQualitySnapshot;
  weather: WeatherSnapshot;
  plan: DailyPlan;
}

const includesAny = (value: string, terms: string[]) =>
  terms.some((term) => value.toLowerCase().includes(term));

export function classifyAssistantIntent(question: string): AssistantIntent {
  const normalized = question.trim().toLowerCase();
  if (includesAny(normalized, ['indoor', 'home', 'room', 'purifier', 'window'])) return 'indoor';
  if (includesAny(normalized, ['commute', 'travel', 'office', 'school', 'walk', 'cycle'])) return 'commute';
  if (includesAny(normalized, ['child', 'children', 'family', 'elder', 'baby', 'pregnan'])) return 'family';
  if (includesAny(normalized, ['impact', 'why', 'co2', 'environment', 'pollution'])) return 'impact';
  if (includesAny(normalized, ['outside', 'outdoor', 'exercise', 'run', 'mask'])) return 'outdoor';
  return 'today';
}

function recommendationFor(context: AssistantContext, category: string) {
  return context.plan.recommendations.find((recommendation) => recommendation.category === category);
}

export function buildAssistantReply(question: string, context: AssistantContext): AssistantReply {
  const intent = classifyAssistantIntent(question);
  const outdoor = recommendationFor(context, 'outdoor_activity');
  const indoor = recommendationFor(context, 'indoor_air');
  const commute = recommendationFor(context, 'commute');
  const emission = recommendationFor(context, 'emission_reduction');
  const vulnerable = context.plan.userProfile.ageGroup !== 'teen_adult' ||
    context.plan.userProfile.healthConditions.some((condition) => condition !== 'none');
  const riskLabel = context.plan.overallRisk.replace('_', ' ');

  const sharedSafety = vulnerable
    ? 'Because this profile includes a higher-sensitivity group, use the more cautious option and follow the person’s clinician guidance.'
    : 'If breathing difficulty, chest pain, confusion, or severe symptoms occur, move to cleaner air and seek urgent local medical help.';

  switch (intent) {
    case 'indoor':
      return {
        intent,
        answer: `For ${context.plan.location.city}, indoor protection is the priority while the effective risk is ${riskLabel}.`,
        keyActions: indoor?.actionItems.slice(0, 4) ?? ['Keep doors and windows closed during the peak smog period.', 'Use filtration if available.'],
        whyItMatters: 'Reducing indoor particle entry and indoor combustion gives the household a cleaner recovery space during a winter inversion.',
        safetyNote: sharedSafety,
        sourceGuidance: indoor?.sourceGuidance ?? 'EPA indoor air-quality guidance',
      };
    case 'commute':
      return {
        intent,
        answer: `For today’s ${context.plan.location.city} conditions, reduce time beside traffic and avoid high-intensity outdoor travel.`,
        keyActions: commute?.actionItems.slice(0, 4) ?? ['Prefer mass transit, carpooling, or remote work when practical.', 'Use recirculation in a vehicle.'],
        whyItMatters: 'Roadside pollution can be higher than the area average, especially when cold air and light winds trap emissions near the ground.',
        safetyNote: sharedSafety,
        sourceGuidance: commute?.sourceGuidance ?? 'Clean mobility and EPA activity guidance',
      };
    case 'family':
      return {
        intent,
        answer: 'For children, older adults, pregnancy, asthma, COPD, and cardiovascular sensitivity, choose the conservative exposure plan.',
        keyActions: [
          'Move exercise and play indoors when the risk is unhealthy for sensitive groups or worse.',
          'Plan short, necessary trips outside the peak smog window.',
          'Keep prescribed medicines available according to the person’s existing care plan.',
        ],
        whyItMatters: 'Sensitive people can experience effects at lower pollution levels than healthy adults, so a household plan should be based on the most sensitive member.',
        safetyNote: 'This assistant does not diagnose or change treatment. Use the person’s clinician instructions and local emergency services for acute symptoms.',
        sourceGuidance: 'EPA AQI sensitive-group guidance and local public-health advice',
      };
    case 'impact':
      return {
        intent,
        answer: 'The lowest-effort high-impact choices today are fewer combustion trips, no unnecessary idling, and avoiding indoor smoke sources.',
        keyActions: emission?.actionItems.slice(0, 4) ?? ['Combine errands.', 'Avoid idling.', 'Choose shared or electric transport where practical.'],
        whyItMatters: emission?.environmentalImpact ?? 'Small household choices add up when an entire neighborhood is under stagnant winter air.',
        safetyNote: sharedSafety,
        sourceGuidance: emission?.sourceGuidance ?? 'UNEP urban air-pollution mitigation guidance',
      };
    case 'outdoor':
      return {
        intent,
        answer: `With AQI ${Math.round(context.airQuality.aqi)} and ${context.weather.condition} conditions, follow the outdoor guidance before exercising or travelling.`,
        keyActions: outdoor?.actionItems.slice(0, 4) ?? ['Avoid strenuous outdoor activity when pollution is high.', 'Choose a shorter route and cleaner time window.'],
        whyItMatters: 'Heavy breathing increases the amount of polluted air inhaled, so changing intensity and timing reduces exposure.',
        safetyNote: sharedSafety,
        sourceGuidance: outdoor?.sourceGuidance ?? 'EPA AQI activity guidance',
      };
    case 'today':
    default:
      return {
        intent,
        answer: `Today’s plan for ${context.plan.location.city}: protect indoor air, reduce peak outdoor exposure, and choose the lowest-emission practical routine.`,
        keyActions: context.plan.recommendations.slice(0, 3).flatMap((recommendation) => recommendation.actionItems.slice(0, 1)),
        whyItMatters: `The plan combines AQI ${Math.round(context.airQuality.aqi)}, ${context.weather.temperatureC}°C weather, ${context.weather.windSpeedKmh} km/h wind, and the resident profile.`,
        safetyNote: sharedSafety,
        sourceGuidance: 'Deterministic local safety fallback; replace with verified live provider data in production',
      };
  }
}

