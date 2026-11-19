import React, { useEffect, useMemo, useState } from 'react';
import { AssistantPanel } from '../components/AssistantPanel';
import { EnvironmentalCard } from '../components/EnvironmentalCard';
import { FallbackBanner } from '../components/FallbackBanner';
import { LocationSelector } from '../components/LocationSelector';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';
import { RecommendationCard } from '../components/RecommendationCard';
import { UserProfileEditor } from '../components/UserProfileEditor';
import { AssistantContext } from '../domain/assistant';
import { generateDailyPlan } from '../domain/recommendationEngine';
import { DailyPlan, Location, RecommendationCategory, UserProfile } from '../domain/types';
import { EnvironmentService } from '../services/EnvironmentService';
import { MockAirQualityProvider } from '../services/MockAirQualityProvider';
import { MockWeatherProvider } from '../services/MockWeatherProvider';
import { MOCK_LOCATIONS } from '../services/mockData';
import { getRiskLevelLabel } from '../utils/formatters';

const LOCATION_STORAGE_KEY = 'breathesafe.location';
const PROFILE_STORAGE_KEY = 'breathesafe.profile';

const DEFAULT_PROFILE: UserProfile = {
  id: 'user-001',
  name: 'Priya Sharma',
  ageGroup: 'teen_adult',
  healthConditions: ['asthma'],
  lifestyle: {
    commuteMode: 'transit',
    commuteDurationMinutes: 45,
    outdoorActivityLevel: 'moderate',
    homeHeatingType: 'electric_heatpump',
  },
  hasAirPurifier: true,
  hasN95Masks: true,
};

function getStoredLocation(): Location {
  if (typeof window === 'undefined') return MOCK_LOCATIONS[0];
  try {
    const locationId = window.localStorage.getItem(LOCATION_STORAGE_KEY);
    return MOCK_LOCATIONS.find((location) => location.id === locationId) ?? MOCK_LOCATIONS[0];
  } catch {
    return MOCK_LOCATIONS[0];
  }
}

function getStoredProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const saved = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!saved) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(saved) } as UserProfile;
  } catch {
    return DEFAULT_PROFILE;
  }
}

function persist(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage is an optional convenience; the app remains functional without it.
  }
}

export const DashboardPage: React.FC = () => {
  const environmentService = useMemo(
    () => new EnvironmentService(
      new MockAirQualityProvider({ simulateDelayMs: 80 }),
      new MockWeatherProvider({ simulateDelayMs: 80 }),
    ),
    [],
  );
  const [selectedLocation, setSelectedLocation] = useState<Location>(getStoredLocation);
  const [userProfile, setUserProfile] = useState<UserProfile>(getStoredProfile);
  const [forceFallback, setForceFallback] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RecommendationCategory | 'all'>('all');
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => persist(LOCATION_STORAGE_KEY, selectedLocation.id), [selectedLocation]);
  useEffect(() => persist(PROFILE_STORAGE_KEY, userProfile), [userProfile]);

  useEffect(() => {
    let cancelled = false;
    const loadPlan = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const context = await environmentService.getEnvironmentalContext(selectedLocation, forceFallback);
        if (cancelled) return;
        setDailyPlan(generateDailyPlan(
          selectedLocation,
          userProfile,
          context.airQuality,
          context.weather,
          context.isFallback,
          context.fallbackReason,
        ));
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch {
        if (!cancelled) setLoadError('We could not prepare the plan. Try refreshing the safety baseline.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void loadPlan();
    return () => { cancelled = true; };
  }, [environmentService, selectedLocation, userProfile, forceFallback, refreshNonce]);

  const filteredRecommendations = useMemo(() => {
    if (!dailyPlan) return [];
    return selectedCategory === 'all'
      ? dailyPlan.recommendations
      : dailyPlan.recommendations.filter((recommendation) => recommendation.category === selectedCategory);
  }, [dailyPlan, selectedCategory]);

  const assistantContext: AssistantContext | null = dailyPlan
    ? { profile: userProfile, airQuality: dailyPlan.airQuality, weather: dailyPlan.weather, plan: dailyPlan }
    : null;

  const riskLabel = dailyPlan ? getRiskLevelLabel(dailyPlan.overallRisk) : 'Preparing plan';

  return (
    <main id="main-content" className="main-content" role="main">
      <section className="hero-shell" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">WINTER AIR DECISION SUPPORT</p>
          <h2 id="page-title">Make today’s air easier to navigate.</h2>
          <p>
            BreatheSafe turns local conditions and resident context into practical actions for cleaner indoor air,
            lower exposure, and lower-emission routines.
          </p>
          <div className="hero-meta" aria-label="Current plan summary">
            <span className="status-pill"><span className="status-dot" aria-hidden="true" /> Safety-first plan</span>
            <span>{selectedLocation.city}, {selectedLocation.country}</span>
            <span>{lastUpdated ? `Updated ${lastUpdated}` : 'Loading conditions'}</span>
          </div>
        </div>
        <div className="hero-score" aria-label={`Current effective risk: ${riskLabel}`}>
          <span className="hero-score-label">CURRENT EFFECTIVE RISK</span>
          <strong>{dailyPlan ? riskLabel : '—'}</strong>
          <span>{dailyPlan ? `AQI ${Math.round(dailyPlan.airQuality.aqi)}` : 'Preparing your plan'}</span>
        </div>
      </section>

      <MedicalDisclaimer />

      <div className="toolbar-row">
        <div>
          <p className="eyebrow">YOUR CONTROL ROOM</p>
          <h2 className="section-title">Today’s breathable-air plan</h2>
          <p className="section-copy">Change the place or resident context to see the recommendation engine recalculate.</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => setRefreshNonce((value) => value + 1)} disabled={isLoading}>
          {isLoading ? 'Refreshing…' : 'Refresh plan'}
        </button>
      </div>

      <FallbackBanner
        isFallback={dailyPlan?.fallbackActive ?? false}
        fallbackReason={dailyPlan?.fallbackReason}
        onToggleForceFallback={setForceFallback}
        isForced={forceFallback}
      />

      {loadError && <div className="error-banner" role="alert">{loadError}</div>}

      <div className="dashboard-grid">
        <aside className="control-column" aria-label="Resident and location controls">
          <LocationSelector selectedLocation={selectedLocation} onSelectLocation={setSelectedLocation} disabled={isLoading} />
          <UserProfileEditor profile={userProfile} onChange={setUserProfile} />
          <div className="card trust-card">
            <p className="eyebrow">TRANSPARENCY</p>
            <h2 className="card-title">What the app knows</h2>
            <ul className="trust-list">
              <li>Location scenario and topography</li>
              <li>Air-quality and weather snapshot</li>
              <li>Resident sensitivities and routine</li>
            </ul>
            <p className="muted-note">Live providers can be connected later through the typed service interfaces. Until then, the app labels mock and fallback data clearly.</p>
          </div>
        </aside>

        <section className="content-column" aria-label="Environmental intelligence and action plan">
          {isLoading && !dailyPlan ? (
            <div className="card loading-card" role="status" aria-live="polite">
              <span className="loading-orb" aria-hidden="true" />
              <div><strong>Building your plan…</strong><p>Combining conditions, profile, and winter exposure rules.</p></div>
            </div>
          ) : dailyPlan ? (
            <>
              <EnvironmentalCard airQuality={dailyPlan.airQuality} weather={dailyPlan.weather} effectiveRisk={dailyPlan.overallRisk} />

              <div className="plan-strip" aria-label="Plan priorities">
                <div><span className="plan-index">01</span><strong>Protect sensitive people</strong><span>Use the most cautious household plan.</span></div>
                <div><span className="plan-index">02</span><strong>Reduce peak exposure</strong><span>Change timing and intensity before changing everything.</span></div>
                <div><span className="plan-index">03</span><strong>Lower local emissions</strong><span>Choose shared, electric, or combined trips.</span></div>
              </div>

              {assistantContext && <AssistantPanel context={assistantContext} />}

              <section className="recommendation-section" aria-labelledby="recommendations-title">
                <div className="section-heading-row">
                  <div>
                    <p className="eyebrow">EXPLAINABLE ACTIONS</p>
                    <h2 id="recommendations-title" className="section-title">Your action feed</h2>
                    <p className="section-copy">Every card shows the action, why it helps, and the guidance basis.</p>
                  </div>
                  <div className="filter-control">
                    <label htmlFor="category-filter">Show</label>
                    <select id="category-filter" className="form-select" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value as RecommendationCategory | 'all')}>
                      <option value="all">All guidance ({dailyPlan.recommendations.length})</option>
                      <option value="outdoor_activity">Outdoor activity</option>
                      <option value="commute">Commute</option>
                      <option value="indoor_air">Indoor air</option>
                      <option value="protective_equipment">Respirator</option>
                      <option value="emission_reduction">Emissions</option>
                    </select>
                  </div>
                </div>
                <div className="recommendation-list" role="feed" aria-busy={isLoading} aria-label="Personalized recommendations">
                  {filteredRecommendations.map((recommendation) => <RecommendationCard key={recommendation.id} recommendation={recommendation} />)}
                </div>
              </section>
            </>
          ) : null}
        </section>
      </div>

      <footer className="app-footer" role="contentinfo">
        <p><strong>BreatheSafe</strong> · PromptWars Virtual Challenge 6 · Urban Air Quality Assistant</p>
        <p>General environmental guidance only. Verify live data, local advisories, and clinician instructions before acting.</p>
      </footer>
    </main>
  );
};

