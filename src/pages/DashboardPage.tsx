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
import { MOCK_LOCATIONS } from '../services/mockData';
import { OpenMeteoAirQualityProvider } from '../services/OpenMeteoAirQualityProvider';
import { OpenMeteoWeatherProvider } from '../services/OpenMeteoWeatherProvider';
import { getRiskLevelLabel } from '../utils/formatters';

const views = [
  { id: 'chat', label: 'Assistant' },
  { id: 'plan', label: 'Action plan' },
  { id: 'insights', label: 'Air insights' },
  { id: 'settings', label: 'Location & profile' },
] as const;
type View = (typeof views)[number]['id'];

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
    const preset = MOCK_LOCATIONS.find((location) => location.id === locationId);
    if (preset) return preset;
    const saved = JSON.parse(locationId ?? 'null') as Location | null;
    if (saved?.country === 'India' && typeof saved.name === 'string' && typeof saved.city === 'string'
        && typeof saved.id === 'string' && Number.isFinite(saved.coordinates?.latitude)
        && Number.isFinite(saved.coordinates?.longitude)) return saved;
    return MOCK_LOCATIONS[0];
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

export const DashboardPage: React.FC<{ initialView?: View }> = ({ initialView }) => {
  const environmentService = useMemo(
    () => new EnvironmentService(
      new OpenMeteoAirQualityProvider(),
      new OpenMeteoWeatherProvider(),
    ),
    [],
  );
  const [selectedLocation, setSelectedLocation] = useState<Location>(getStoredLocation);
  const [userProfile, setUserProfile] = useState<UserProfile>(getStoredProfile);
  const [view, setView] = useState<View>(initialView ?? 'chat');
  const [forceFallback, setForceFallback] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RecommendationCategory | 'all'>('all');
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const value = MOCK_LOCATIONS.includes(selectedLocation) ? selectedLocation.id : JSON.stringify(selectedLocation);
    try { window.localStorage.setItem(LOCATION_STORAGE_KEY, value); } catch { /* Optional storage. */ }
  }, [selectedLocation]);
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
          context.dataSource,
          context.dataAttribution,
        ));
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch {
        if (!cancelled) {
          setDailyPlan(null);
          setLoadError('We could not prepare the plan. Try refreshing conditions.');
        }
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

  const currentPlan = dailyPlan?.location === selectedLocation && dailyPlan.userProfile === userProfile
    ? dailyPlan
    : null;
  const assistantContext: AssistantContext | null = currentPlan
    ? { profile: currentPlan.userProfile, airQuality: currentPlan.airQuality, weather: currentPlan.weather, plan: currentPlan }
    : null;

  return (
    <main id="main-content" className="main-content resident-dashboard" tabIndex={-1}>
      <header className="workspace-summary">
        <div>
          <h1>Your air today</h1>
          <p>{selectedLocation.name}, {selectedLocation.country}</p>
        </div>
        {currentPlan && (
          <div className="workspace-reading">
            <strong>{currentPlan.airQuality.isStaleOrFallback ? 'Sample ' : ''}US AQI {Math.round(currentPlan.airQuality.aqi)}</strong>
            <span>{getRiskLevelLabel(currentPlan.overallRisk)} · {currentPlan.fallbackActive ? 'Fallback in use' : 'Model estimate'}</span>
          </div>
        )}
      </header>

      <div className="workspace-layout">
        <nav className="workspace-nav" aria-label="Dashboard views">
          {views.map(({ id, label }) => (
            <button key={id} type="button" aria-current={view === id ? 'page' : undefined} onClick={() => setView(id)}>
              {label}
            </button>
          ))}
        </nav>

        <div className="workspace-content">
          {view !== 'settings' && loadError && (
            <div className="error-banner" role="alert">
              <p>{loadError}</p>
              <button className="secondary-button" type="button" onClick={() => setRefreshNonce((value) => value + 1)}>Try again</button>
            </div>
          )}
          {view !== 'settings' && !loadError && (isLoading || !currentPlan) && (
            <p className="workspace-loading" role="status">Updating conditions and your plan…</p>
          )}
          {currentPlan?.fallbackActive && view !== 'insights' && view !== 'settings' && (
            <p className="workspace-loading" role="status">Some conditions use sample data. <button type="button" className="workspace-text-button" onClick={() => setView('insights')}>Check data sources</button></p>
          )}

          <div className="workspace-chat" hidden={view !== 'chat'}>
            {assistantContext && <AssistantPanel key={currentPlan?.generatedAt} context={assistantContext} />}
            {currentPlan?.recommendations[0] && (
              <aside className="next-action" aria-labelledby="next-action-title">
                <h2 id="next-action-title">Start here</h2>
                <strong>{currentPlan.recommendations[0].title}</strong>
                <p>{currentPlan.recommendations[0].summary}</p>
                <button type="button" onClick={() => setView('plan')}>See your full plan <span aria-hidden="true">↗</span></button>
              </aside>
            )}
          </div>

          {view === 'plan' && currentPlan && (
            <section className="recommendation-section" aria-labelledby="recommendations-title">
              <div className="section-heading-row">
                <div>
                  <h2 id="recommendations-title" className="section-title">Recommended actions</h2>
                  <p className="section-copy">Practical steps for the location and profile you selected.</p>
                </div>
                <div className="filter-control">
                  <label htmlFor="category-filter">Show</label>
                  <select id="category-filter" className="form-select" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value as RecommendationCategory | 'all')}>
                    <option value="all">All guidance ({currentPlan.recommendations.length})</option>
                    <option value="outdoor_activity">Outdoor activity</option>
                    <option value="commute">Commute</option>
                    <option value="indoor_air">Indoor air</option>
                    <option value="protective_equipment">Respirator</option>
                    <option value="emission_reduction">Emissions</option>
                  </select>
                </div>
              </div>
              <div className="recommendation-list" aria-busy={isLoading} aria-label="Personalized recommendations">
                {filteredRecommendations.length === 0 && <p className="section-copy">No actions in this category today.</p>}
                  {filteredRecommendations.map((recommendation) => <RecommendationCard key={recommendation.id} recommendation={recommendation} />)}
              </div>
            </section>
          )}

          {view === 'insights' && (
            <section className="workspace-insights" aria-labelledby="insights-title">
              <div className="section-heading-row">
                <div>
                  <h2 id="insights-title" className="section-title">Air insights</h2>
                  <p className="section-copy">Modelled US AQI and weather for the selected location{lastUpdated && currentPlan ? ` · refreshed at ${lastUpdated}` : ''}.</p>
                </div>
                <button className="secondary-button" type="button" disabled={isLoading} onClick={() => setRefreshNonce((value) => value + 1)}>
                  Refresh conditions
                </button>
              </div>
              {currentPlan && (
                <>
                  <EnvironmentalCard
                    airQuality={currentPlan.airQuality}
                    weather={currentPlan.weather}
                    effectiveRisk={currentPlan.overallRisk}
                    dataSource={currentPlan.dataSource}
                    dataAttribution={currentPlan.dataAttribution}
                  />
                  <FallbackBanner
                    isFallback={currentPlan.fallbackActive}
                    fallbackReason={currentPlan.fallbackReason}
                    onToggleForceFallback={setForceFallback}
                    isForced={forceFallback}
                  />
                </>
              )}
            </section>
          )}

          {view === 'settings' && (
            <section className="workspace-settings" aria-label="Location and resident profile">
              <LocationSelector selectedLocation={selectedLocation} onSelectLocation={setSelectedLocation} />
              <UserProfileEditor profile={userProfile} onChange={setUserProfile} />
            </section>
          )}
        </div>
      </div>
      <MedicalDisclaimer />
    </main>
  );
};

