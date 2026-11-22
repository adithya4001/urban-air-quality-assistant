import React, { useEffect, useMemo, useState } from 'react';
import { AssistantPanel } from '../components/AssistantPanel';
import { EnvironmentalCard } from '../components/EnvironmentalCard';
import { FallbackBanner } from '../components/FallbackBanner';
import { LocationPlanner } from '../components/LocationPlanner';
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
import { DailySetup } from '../components/DailySetup';
import { DailyAudienceCards } from '../components/DailyAudienceCards';
import { PrecautionCenter } from '../components/PrecautionCenter';
import { usePreferences } from '../domain/preferences';
import { AirInsightsDashboard } from '../components/AirInsightsDashboard';

const views = [
  { id: 'home', label: 'Home' },
  { id: 'chat', label: 'Chat with agent' },
  { id: 'insights', label: 'Weather & air insights' },
  { id: 'plan', label: 'Today’s approved plan' },
  { id: 'safety', label: 'Safety & sources' },
  { id: 'precaution', label: 'Precaution centre' },
  { id: 'settings', label: 'Location & profile' },
  { id: 'personal', label: 'Personal details' },
] as const;
type View = (typeof views)[number]['id'];

const LOCATION_STORAGE_KEY = 'breathesafe.location';
const PROFILE_STORAGE_KEY = 'breathesafe.profile';

const DEFAULT_PROFILE: UserProfile = {
  id: 'user-001',
  name: 'Resident',
  ageGroup: 'teen_adult',
  healthConditions: ['none'],
  lifestyle: {
    commuteMode: 'transit',
    commuteDurationMinutes: 45,
    outdoorActivityLevel: 'moderate',
    homeHeatingType: 'electric_heatpump',
  },
  hasAirPurifier: false,
  hasN95Masks: false,
};

function getStoredLocation(key: string): Location {
  if (typeof window === 'undefined') return MOCK_LOCATIONS[0];
  try {
    const locationId = window.localStorage.getItem(key);
    const preset = MOCK_LOCATIONS.find((location) => location.id === locationId);
    if (preset) return preset;
    const saved = JSON.parse(locationId ?? 'null') as Location | null;
    if (typeof saved?.country === 'string' && typeof saved.name === 'string' && typeof saved.city === 'string'
        && typeof saved.id === 'string' && Number.isFinite(saved.coordinates?.latitude)
        && Number.isFinite(saved.coordinates?.longitude)) return saved;
    return MOCK_LOCATIONS[0];
  } catch {
    return MOCK_LOCATIONS[0];
  }
}

function getStoredProfile(key: string): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const saved = window.localStorage.getItem(key);
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

export const DashboardPage: React.FC<{ userId: string; initialView?: View; settingsRequest?: number; personalRequest?: number; dailySetupRequest?: number; sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void }> = ({ userId, initialView, settingsRequest, personalRequest, dailySetupRequest, sidebarOpen, setSidebarOpen }) => {
  const {prefs} = usePreferences();
  const environmentService = useMemo(
    () => new EnvironmentService(
      new OpenMeteoAirQualityProvider(),
      new OpenMeteoWeatherProvider(),
    ),
    [],
  );
  const locationKey = `${LOCATION_STORAGE_KEY}.${userId}`;
  const profileKey = `${PROFILE_STORAGE_KEY}.${userId}`;
  const [selectedLocation, setSelectedLocation] = useState<Location>(() => getStoredLocation(locationKey));
  const [savedLocation, setSavedLocation] = useState<Location>(() => getStoredLocation(locationKey));
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getStoredProfile(profileKey));
  const [view, setView] = useState<View>(initialView ?? 'home');
  const [setupOpen, setSetupOpen] = useState(false);
  useEffect(() => { if (dailySetupRequest) setSetupOpen(true); }, [dailySetupRequest]);
  useEffect(() => { if (settingsRequest) setView('settings'); }, [settingsRequest]);
  useEffect(() => { if (personalRequest) setView('personal'); }, [personalRequest]);
  const approvedKey = `vaayudootha.approved-plan.${userId}`;
  const [approvedPlan, setApprovedPlan] = useState<DailyPlan | null>(() => {
    try { const saved = JSON.parse(localStorage.getItem(approvedKey) || 'null'); return saved && Array.isArray(saved.recommendations) && saved.location && saved.generatedAt ? saved as DailyPlan : null; } catch { return null; }
  });
  const [forceFallback, setForceFallback] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RecommendationCategory | 'all'>('all');
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const value = MOCK_LOCATIONS.includes(savedLocation) ? savedLocation.id : JSON.stringify(savedLocation);
    try { window.localStorage.setItem(locationKey, value); } catch { /* Optional storage. */ }
  }, [savedLocation, locationKey]);
  useEffect(() => persist(profileKey, userProfile), [userProfile, profileKey]);

  useEffect(() => {
    if (prefs.refreshMinutes === 'off') return;
    const timer = window.setInterval(() => setRefreshNonce((value) => value + 1), Number(prefs.refreshMinutes) * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [prefs.refreshMinutes]);

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
    if (!approvedPlan) return [];
    return selectedCategory === 'all'
      ? approvedPlan.recommendations
      : approvedPlan.recommendations.filter((recommendation) => recommendation.category === selectedCategory);
  }, [approvedPlan, selectedCategory]);

  const currentPlan = dailyPlan?.location === selectedLocation && dailyPlan.userProfile === userProfile
    ? dailyPlan
    : null;
  const assistantContext: AssistantContext | null = currentPlan
    ? { profile: currentPlan.userProfile, airQuality: currentPlan.airQuality, weather: currentPlan.weather, plan: currentPlan }
    : null;

  return (
    <main id="main-content" className={`main-content resident-dashboard ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} tabIndex={-1}>
      <nav id="daily-sidebar" className="daily-sidebar" aria-label="Main navigation" hidden={!sidebarOpen}>
        <p>YOUR AIR COMPANION</p>
        {views.filter(({id}) => id !== 'settings' && id !== 'personal').map(({id,label}) => <button key={id} className={view===id?'selected':''} onClick={() => {setView(id); if(window.innerWidth<800)setSidebarOpen(false)}}>{label}</button>)}
      </nav>
      <div className="daily-main-area">
      <header className={`workspace-summary ${view === 'home' || view === 'chat' || view === 'settings' || view === 'personal' ? 'dashboard-home-hidden' : ''}`}>
        <div>
          <h1>Your air today</h1>
          <p>{selectedLocation.name}, {selectedLocation.country}</p>
        </div>
        {currentPlan && (
          <div className="workspace-reading">
            <strong>{currentPlan.airQuality.isStaleOrFallback ? 'Sample ' : ''}US AQI {Math.round(currentPlan.airQuality.aqi)}</strong>
            <span>{getRiskLevelLabel(currentPlan.airQuality.riskLevel)} · {currentPlan.fallbackActive ? 'Fallback in use' : 'Model estimate'}</span>
          </div>
        )}
      </header>

      {view === 'home' && <section className="daily-home">
        <div className="daily-hero"><img src="https://images.pexels.com/photos/2792605/pexels-photo-2792605.jpeg?auto=compress&cs=tinysrgb&w=2200" alt="Misty winter city at dawn"/><div className="daily-hero-overlay"/><div className="daily-hero-content"><span className="daily-eyebrow">WINTER AIR · YOUR DAY · YOUR ROUTINE</span><h2>A clearer plan for a hazy day.</h2><p>Bring your location, daily routine and local air conditions together. Get practical next steps you can ask questions about.</p><button className="daily-hero-button" onClick={()=>{setView('chat');window.scrollTo({top:0,behavior:'smooth'})}}>Chat with agent ↗</button></div></div>
        <section className="daily-section"><div className="daily-section-heading"><div><span className="daily-eyebrow">WHO IT HELPS</span><h2>Made for the way you move through a day.</h2></div><p>Outdoor activities, family routines and daily commutes meet the same changing winter air in different ways.</p></div><DailyAudienceCards /></section>
        <section className="daily-workflow"><div><span className="daily-eyebrow">HOW YOUR PLAN COMES TOGETHER</span><h2>Context in. Clear actions out.</h2><p>Set up the parts of your day that matter. Then explore and adjust your plan in a conversation with the assistant.</p><button className="daily-outline-button" onClick={()=>{setView('chat');window.scrollTo({top:0,behavior:'smooth'})}}>Chat with agent →</button></div><ol className="daily-flowchart" aria-label="How your plan comes together">{[
          { number:'01', title:'Your personal context', description:'Location, activities, hobbies and health sensitivities.', image:'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=480' },
          { number:'02', title:'Your workday', description:'Work location, days, hours and commute.', image:'https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg?auto=compress&cs=tinysrgb&w=480' },
          { number:'03', title:'A daily air plan', description:'AQI and weather inform practical actions for your routine.', image:'https://images.pexels.com/photos/125510/pexels-photo-125510.jpeg?auto=compress&cs=tinysrgb&w=480' },
          { number:'04', title:'Talk it through', description:'Ask the agent questions and choose reminders.', image:'https://images.pexels.com/photos/4065876/pexels-photo-4065876.jpeg?auto=compress&cs=tinysrgb&w=480' },
        ].map((step,index)=><li key={step.number}><article><img src={step.image} alt="" loading="lazy"/><div className="daily-flow-copy"><span>STEP {step.number}</span><h3>{step.title}</h3><p>{step.description}</p></div></article>{index<3&&<span className="daily-flow-arrow" aria-hidden="true">↓</span>}</li>)}</ol></section>
        <section className="precaution-intro"><div className="precaution-intro-heading"><div><span className="daily-eyebrow">CARE THROUGH THE COLD</span><h2>A little extra care for winter days.</h2></div><p>Explore practical precautions, understand when to seek care and find guidance for your questions.</p></div><div className="precaution-features">{[{title:'Understand your symptoms',text:'Learn when to speak with a healthcare professional about new or worsening symptoms.',image:'https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg?auto=compress&cs=tinysrgb&w=800'},{title:'Protect your breathing',text:'Find simple ways to reduce exposure to cold air, smoke and pollution.',image:'https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg?auto=compress&cs=tinysrgb&w=800'},{title:'Care for your loved ones',text:'Consider the needs of children, older adults and people with existing conditions.',image:'https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=800'}].map(item=><article key={item.title}><img src={item.image} alt="" loading="lazy"/><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div><button className="daily-hero-button precaution-open" onClick={()=>{setView('precaution');window.scrollTo({top:0,behavior:'smooth'})}}>Explore precaution centre ↗</button></section>
      </section>}
      {setupOpen&&<DailySetup close={()=>setSetupOpen(false)} complete={()=>{setSetupOpen(false);setView('chat')}}/>}

      <div className="workspace-layout">

        <div className="workspace-content">
          {view !== 'settings' && view !== 'personal' && loadError && (
            <div className="error-banner" role="alert">
              <p>{loadError}</p>
              <button className="secondary-button" type="button" onClick={() => setRefreshNonce((value) => value + 1)}>Try again</button>
            </div>
          )}
          {view !== 'settings' && view !== 'personal' && !loadError && (isLoading || !currentPlan) && (
            <p className="workspace-loading" role="status">Updating conditions and your plan…</p>
          )}
          {currentPlan?.fallbackActive && view !== 'insights' && view !== 'settings' && view !== 'personal' && (
            <p className="workspace-loading" role="status">Some conditions use sample data. <button type="button" className="workspace-text-button" onClick={() => setView('insights')}>Check data sources</button></p>
          )}

          <div className="workspace-chat" hidden={view !== 'chat'}>
            {assistantContext && <AssistantPanel userId={userId} context={assistantContext} onApprove={() => {if(currentPlan){setApprovedPlan(currentPlan);persist(approvedKey, currentPlan);setSelectedCategory('all');setView('plan')}}} />}
          </div>

          {view === 'plan' && currentPlan && (
            <section className="recommendation-section" aria-labelledby="recommendations-title">
              <div className="section-heading-row">
                <div>
                  <h2 id="recommendations-title" className="section-title">Recommended actions</h2>
                  <p className="section-copy">{approvedPlan ? `Approved plan for ${approvedPlan.location.city} · based on conditions at ${new Date(approvedPlan.generatedAt).toLocaleString()}. Review and approve again when conditions or your routine change.` : 'Your plan is empty. Review today’s suggested actions in chat, then approve the plan to save it here.'}</p>
                  {!approvedPlan && <button type="button" className="secondary-button" onClick={() => setView('chat')}>Go to chat and review plan →</button>}
                  {approvedPlan && <button className="secondary-button" onClick={() => {window.speechSynthesis.cancel();window.speechSynthesis.speak(new SpeechSynthesisUtterance(approvedPlan.recommendations.map(r=>`${r.title}. ${r.summary}`).join('. ')))}}>Read plan aloud</button>}
                </div>
                <div className="filter-control">
                  <label htmlFor="category-filter">Show</label>
                  <select id="category-filter" className="form-select" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value as RecommendationCategory | 'all')}>
                    <option value="all">All guidance ({approvedPlan?.recommendations.length ?? 0})</option>
                    <option value="outdoor_activity">Outdoor activity</option>
                    <option value="commute">Commute</option>
                    <option value="indoor_air">Indoor air</option>
                    <option value="protective_equipment">Respirator</option>
                    <option value="emission_reduction">Emissions</option>
                  </select>
                </div>
              </div>
              <div className="recommendation-list" aria-busy={isLoading} aria-label="Personalized recommendations">
                {approvedPlan && filteredRecommendations.length === 0 && <p className="section-copy">No actions in this category in your approved plan.</p>}
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
                  <AirInsightsDashboard location={selectedLocation} refreshNonce={refreshNonce} />
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
              <LocationPlanner userId={userId} selectedLocation={selectedLocation} onSelectLocation={(location, permanent) => { setSelectedLocation(location); if (permanent) setSavedLocation(location); }} />
            </section>
          )}
          {view === 'personal' && <section className="workspace-settings" aria-label="Personal details"><UserProfileEditor profile={userProfile} onChange={setUserProfile} /></section>}
          {view === 'safety' && <section className="card safety-sources"><h2>Safety & trusted sources</h2><p>Use today’s air and weather information to choose suitable precautions. Conditions can change during the day.</p><ul><li>Reduce strenuous outdoor activity when air quality is poor, particularly if you are sensitive to pollution.</li><li>Keep indoor air cleaner by limiting smoke and using filtration when available.</li><li>Follow your clinician’s existing advice for health conditions.</li></ul><h3>Weather updates and guidance</h3><p>Open these sources for current local warnings and news:</p><ul><li><a href="https://mausam.imd.gov.in/" target="_blank" rel="noreferrer">India Meteorological Department</a></li><li><a href="https://airquality.cpcb.gov.in/" target="_blank" rel="noreferrer">Central Pollution Control Board — air quality</a></li><li><a href="https://www.who.int/health-topics/air-pollution" target="_blank" rel="noreferrer">WHO — air pollution and health</a></li></ul></section>}
          {view === 'precaution' && <PrecautionCenter context={assistantContext} />}
        </div>
      </div>
      <MedicalDisclaimer />
      </div>
    </main>
  );
};


