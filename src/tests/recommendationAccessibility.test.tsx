import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { RecommendationCard } from '../components/RecommendationCard';
import { AirDecisionFlow } from '../components/AirDecisionFlow';
import { DailyAudienceCards } from '../components/DailyAudienceCards';
import { DailySetup } from '../components/DailySetup';
import { PrecautionCenter } from '../components/PrecautionCenter';
import { MEDICAL_DISCLAIMER } from '../domain/recommendationEngine';
import type { Recommendation } from '../domain/types';

vi.mock('@clerk/react', () => ({ useAuth: () => ({ getToken: vi.fn() }) }));

const recommendation: Recommendation = {
  id: 'accessible-outdoor-plan',
  category: 'outdoor_activity',
  title: 'Choose a lower-exposure activity',
  summary: 'Current air conditions call for a practical adjustment.',
  actionItems: ['Move vigorous exercise indoors.'],
  healthImpact: 'Lower exertion reduces inhaled particle dose.',
  environmentalImpact: 'Fewer unnecessary trips reduce local emissions.',
  priority: 'high',
  safetyNotice: 'Follow your clinician’s existing advice.',
  sourceGuidance: 'EPA AirNow activity recommendations',
};

describe('recommendation accessibility markup', () => {
  it('associates each recommendation article with its heading and keeps actions in a list', () => {
    const html = renderToStaticMarkup(createElement(RecommendationCard, { recommendation }));

    expect(html).toContain('aria-labelledby="rec-title-accessible-outdoor-plan"');
    expect(html).toContain('<h3 id="rec-title-accessible-outdoor-plan" class="recommendation-title">Choose a lower-exposure activity</h3>');
    expect(html).toContain('<ul><li>Move vigorous exercise indoors.</li></ul>');
    expect(html).toContain('role="note"');
    expect(html).toContain('Health &amp; Exposure Impact');
    expect(html).toContain('Guidance source: EPA AirNow activity recommendations');
  });

  it('exposes the wellbeing disclaimer in the page copy used by the interface', () => {
    expect(MEDICAL_DISCLAIMER).toContain('does not provide medical diagnosis');
    expect(MEDICAL_DISCLAIMER).toContain('Always follow physician advice');
  });

  it('renders the welcome flow as named groups with a selected step', () => {
    const html = renderToStaticMarkup(createElement(AirDecisionFlow));

    expect(html).toContain('role="group" aria-label="How VaayuDootha turns context into action"');
    expect(html).toContain('role="group" aria-label="Explore the steps"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('Air + winter');
  });

  it('gives audience flip cards clear names and a keyboard-operable button control', () => {
    const html = renderToStaticMarkup(createElement(DailyAudienceCards));

    expect((html.match(/<button/g) || []).length).toBe(3);
    expect(html).toContain('aria-label="Outdoor routines:');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('Families &amp; caregivers');
  });

  it('labels the precaution conversation log and connects the input to its visible label', () => {
    const html = renderToStaticMarkup(createElement(PrecautionCenter, { context: null }));

    expect(html).toContain('aria-labelledby="precaution-title"');
    expect(html).toContain('role="log" aria-label="Health guidance conversation"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('<label for="health-question">What would you like to ask?</label>');
    expect(html).toContain('id="health-question"');
  });

  it('names the daily setup dialog and gives its current step a programmatic focus target', () => {
    const html = renderToStaticMarkup(createElement(DailySetup, { close: () => {}, complete: () => {} }));

    expect(html).toContain('role="dialog" aria-modal="true" aria-labelledby="daily-setup-title"');
    expect(html).toContain('id="daily-setup-title" tabindex="-1" data-dialog-initial-focus="true" data-dialog-step-focus="true"');
    expect(html).toContain('type="button"');
  });
});
