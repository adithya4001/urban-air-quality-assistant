import { describe, expect, it } from 'vitest';
import {
  calculateEffectiveRiskLevel,
  generateDailyPlan,
  isUserVulnerable,
  MEDICAL_DISCLAIMER,
} from '../domain/recommendationEngine';
import {
  AirQualitySnapshot,
  Location,
  UserProfile,
  WeatherSnapshot,
} from '../domain/types';

describe('Deterministic Recommendation Engine', () => {
  const baseLocation: Location = {
    id: 'loc-test',
    name: 'Test Urban Basin',
    city: 'Test City',
    country: 'Testland',
    coordinates: { latitude: 35.0, longitude: 139.0 },
    isValleyOrBasin: true,
  };

  const healthyAdultProfile: UserProfile = {
    id: 'user-healthy',
    name: 'Alex Rivera',
    ageGroup: 'teen_adult',
    healthConditions: ['none'],
    lifestyle: {
      commuteMode: 'car',
      commuteDurationMinutes: 35,
      outdoorActivityLevel: 'high',
      homeHeatingType: 'natural_gas',
    },
    hasAirPurifier: true,
    hasN95Masks: true,
  };

  const asthmaticChildProfile: UserProfile = {
    id: 'user-vulnerable',
    name: 'Sammy Chen',
    ageGroup: 'infant_child',
    healthConditions: ['asthma'],
    lifestyle: {
      commuteMode: 'walking',
      commuteDurationMinutes: 20,
      outdoorActivityLevel: 'moderate',
      homeHeatingType: 'wood_biomass',
    },
    hasAirPurifier: false,
    hasN95Masks: false,
  };

  const clearWeather: WeatherSnapshot = {
    timestamp: '2026-11-19T08:00:00Z',
    temperatureC: 15,
    humidityPercent: 50,
    windSpeedKmh: 18,
    windDirection: 'SW',
    condition: 'clear',
    inversionRisk: 'none',
    forecastSummary: 'Clear skies with good wind dispersion.',
  };

  const severeInversionWeather: WeatherSnapshot = {
    timestamp: '2026-11-19T08:00:00Z',
    temperatureC: -4,
    humidityPercent: 88,
    windSpeedKmh: 2.5,
    windDirection: 'Calm',
    condition: 'inversion',
    inversionRisk: 'severe',
    forecastSummary: 'Strong nocturnal thermal inversion trapping toxic ground pollutants.',
  };

  const lowAqi: AirQualitySnapshot = {
    timestamp: '2026-11-19T08:00:00Z',
    aqi: 32,
    primaryPollutant: 'PM2.5',
    pm25: 7.5,
    pm10: 15.0,
    riskLevel: 'low',
  };

  const moderateAqi: AirQualitySnapshot = {
    timestamp: '2026-11-19T08:00:00Z',
    aqi: 75,
    primaryPollutant: 'PM2.5',
    pm25: 23.5,
    pm10: 45.0,
    riskLevel: 'moderate',
  };

  const hazardousSmogAqi: AirQualitySnapshot = {
    timestamp: '2026-11-19T08:00:00Z',
    aqi: 340,
    primaryPollutant: 'PM2.5',
    pm25: 290.0,
    pm10: 420.0,
    riskLevel: 'hazardous',
    dominantSource: 'biomass_burning',
  };

  describe('Vulnerability & Risk Assessment', () => {
    it('identifies healthy adult as non-vulnerable', () => {
      expect(isUserVulnerable(healthyAdultProfile)).toBe(false);
    });

    it('identifies child with asthma as vulnerable', () => {
      expect(isUserVulnerable(asthmaticChildProfile)).toBe(true);
    });

    it('escalates moderate risk to unhealthy_sensitive for vulnerable users', () => {
      const risk = calculateEffectiveRiskLevel(moderateAqi, asthmaticChildProfile);
      expect(risk).toBe('unhealthy_sensitive');
    });

    it('keeps base risk unchanged for non-vulnerable users', () => {
      const risk = calculateEffectiveRiskLevel(moderateAqi, healthyAdultProfile);
      expect(risk).toBe('moderate');
    });
  });

  describe('DailyPlan Generation & Safety Guardrails', () => {
    it('produces high-priority indoor and respirator guidance during hazardous winter smog', () => {
      const plan = generateDailyPlan(
        baseLocation,
        asthmaticChildProfile,
        hazardousSmogAqi,
        severeInversionWeather
      );

      expect(plan.overallRisk).toBe('hazardous');
      expect(plan.recommendations.length).toBeGreaterThanOrEqual(4);

      const outdoorRec = plan.recommendations.find((r) => r.category === 'outdoor_activity');
      expect(outdoorRec).toBeDefined();
      expect(outdoorRec?.priority).toBe('critical');
      expect(outdoorRec?.actionItems.some((a) => a.includes('inhalers'))).toBe(true);
      expect(outdoorRec?.safetyNotice).toContain('breathing difficulty');

      const ppeRec = plan.recommendations.find((r) => r.category === 'protective_equipment');
      expect(ppeRec?.title).toContain('Particulate Respirator');
      expect(ppeRec?.summary).toContain('does not filter gases');
      expect(ppeRec?.priority).toBe('high');
      expect(ppeRec?.safetyNotice).toContain('clinician’s advice');
    });

    it('recommends mass transit and eco-driving for solo car drivers during smog', () => {
      const plan = generateDailyPlan(
        baseLocation,
        healthyAdultProfile,
        hazardousSmogAqi,
        severeInversionWeather
      );

      const commuteRec = plan.recommendations.find((r) => r.category === 'commute');
      expect(commuteRec).toBeDefined();
      expect(commuteRec?.healthImpact).toBeTruthy();
      expect(commuteRec?.environmentalImpact).toBeTruthy();
    });

    it('keeps a remote worker’s commute plan remote rather than prescribing a commute', () => {
      const remoteProfile: UserProfile = {
        ...healthyAdultProfile,
        lifestyle: { ...healthyAdultProfile.lifestyle, commuteMode: 'wfh' },
      };
      const plan = generateDailyPlan(baseLocation, remoteProfile, hazardousSmogAqi, severeInversionWeather);
      const commute = plan.recommendations.find((item) => item.category === 'commute');

      expect(commute?.title).toContain('Remote');
      expect(commute?.actionItems.join(' ').toLowerCase()).not.toContain('mass transit');
      expect(commute?.actionItems.join(' ').toLowerCase()).toContain('essential trip');
    });

    it('adapts active commuters’ actions when air quality is elevated', () => {
      const activeProfile: UserProfile = {
        ...healthyAdultProfile,
        lifestyle: { ...healthyAdultProfile.lifestyle, commuteMode: 'cycling' },
      };
      const elevatedAqi: AirQualitySnapshot = { ...moderateAqi, aqi: 164, riskLevel: 'unhealthy' };
      const plan = generateDailyPlan(baseLocation, activeProfile, elevatedAqi, clearWeather);
      const commute = plan.recommendations.find((item) => item.category === 'commute');

      expect(commute?.title).toContain('Active Commute');
      expect(commute?.actionItems.join(' ').toLowerCase()).toContain('public transit');
      expect(commute?.actionItems.join(' ').toLowerCase()).toContain('hourly');
    });

    it.each([
      ['car', 'Limit Traffic Exposure', 'recirculation'],
      ['transit', 'Reduce Roadside Waiting', 'wait indoors'],
    ] as const)('gives %s commuters exposure guidance at unhealthy AQI', (mode, title, action) => {
      const profile: UserProfile = {
        ...healthyAdultProfile,
        lifestyle: { ...healthyAdultProfile.lifestyle, commuteMode: mode },
      };
      const elevatedAqi: AirQualitySnapshot = { ...moderateAqi, aqi: 164, riskLevel: 'unhealthy' };
      const plan = generateDailyPlan(baseLocation, profile, elevatedAqi, clearWeather);
      const commute = plan.recommendations.find((item) => item.category === 'commute');

      expect(commute?.title).toContain(title);
      expect(commute?.actionItems.join(' ').toLowerCase()).toContain(action);
      expect(commute?.priority).toBe('high');
    });

    it('keeps a favorable AQI rating while advising a fresh check during an inversion', () => {
      const inversionWeather: WeatherSnapshot = { ...clearWeather, inversionRisk: 'severe' };
      const plan = generateDailyPlan(baseLocation, healthyAdultProfile, lowAqi, inversionWeather);
      const outdoor = plan.recommendations.find((item) => item.category === 'outdoor_activity');

      expect(plan.overallRisk).toBe('low');
      expect(outdoor?.title).toContain('Recheck Conditions');
      expect(outdoor?.summary).toContain('current AQI is within acceptable limits');
      expect(outdoor?.actionItems.join(' ').toLowerCase()).toContain('hourly air-quality forecast');
    });

    it('changes outdoor actions to match a resident’s activity pattern', () => {
      const activeProfile: UserProfile = {
        ...healthyAdultProfile,
        lifestyle: { ...healthyAdultProfile.lifestyle, outdoorActivityLevel: 'high' },
      };
      const lowActivityProfile: UserProfile = {
        ...healthyAdultProfile,
        lifestyle: { ...healthyAdultProfile.lifestyle, outdoorActivityLevel: 'low' },
      };
      const activePlan = generateDailyPlan(baseLocation, activeProfile, hazardousSmogAqi, severeInversionWeather);
      const lowActivityPlan = generateDailyPlan(baseLocation, lowActivityProfile, hazardousSmogAqi, severeInversionWeather);
      const activeAdvice = activePlan.recommendations.find((item) => item.category === 'outdoor_activity');
      const lowActivityAdvice = lowActivityPlan.recommendations.find((item) => item.category === 'outdoor_activity');

      expect(activeAdvice?.actionItems[0]).toContain('Move runs');
      expect(lowActivityAdvice?.actionItems[0]).toContain('Keep essential outdoor time brief');
    });

    it('always returns one complete recommendation for every supported category', () => {
      const plan = generateDailyPlan(baseLocation, healthyAdultProfile, lowAqi, clearWeather);
      const categories = plan.recommendations.map((recommendation) => recommendation.category);

      expect(categories).toEqual([
        'outdoor_activity', 'commute', 'indoor_air', 'protective_equipment', 'emission_reduction',
      ]);
      for (const recommendation of plan.recommendations) {
        expect(recommendation.id).toBeTruthy();
        expect(recommendation.actionItems.length).toBeGreaterThan(0);
        expect(recommendation.healthImpact).toBeTruthy();
        expect(recommendation.environmentalImpact).toBeTruthy();
        expect(recommendation.sourceGuidance).toBeTruthy();
      }
    });

    it('flags wood/biomass heating and recommends filtration for home indoor air', () => {
      const plan = generateDailyPlan(
        baseLocation,
        asthmaticChildProfile,
        hazardousSmogAqi,
        severeInversionWeather
      );

      const indoorRec = plan.recommendations.find((r) => r.category === 'indoor_air');
      expect(indoorRec).toBeDefined();
      expect(indoorRec?.actionItems.some((a) => a.toLowerCase().includes('wood stoves'))).toBe(
        true
      );
    });

    it('handles low pollution baseline safely without unnecessary alarms', () => {
      const plan = generateDailyPlan(
        baseLocation,
        healthyAdultProfile,
        lowAqi,
        clearWeather
      );

      expect(plan.overallRisk).toBe('low');
      const ppeRec = plan.recommendations.find((r) => r.category === 'protective_equipment');
      expect(ppeRec?.priority).toBe('low');
      expect(ppeRec?.title).toContain('No AQI-Based');
    });

    it('does not recommend particle respirators as protection for a gas-led AQI', () => {
      const gasLedAqi: AirQualitySnapshot = {
        ...hazardousSmogAqi,
        primaryPollutant: 'NO2',
      };
      const plan = generateDailyPlan(baseLocation, healthyAdultProfile, gasLedAqi, clearWeather);
      const ppe = plan.recommendations.find((item) => item.category === 'protective_equipment');

      expect(ppe?.title).toContain('No AQI-Based');
      expect(ppe?.summary).toContain('filter particles, not gases');
      expect(ppe?.actionItems.join(' ').toLowerCase()).toContain('do not rely on an n95/ffp2');
    });

    it('flags fallback state accurately when fallback is active', () => {
      const plan = generateDailyPlan(
        baseLocation,
        healthyAdultProfile,
        hazardousSmogAqi,
        severeInversionWeather,
        true,
        'Sensor network timeout'
      );

      expect(plan.fallbackActive).toBe(true);
      expect(plan.fallbackReason).toBe('Sensor network timeout');
    });

    it('includes medical disclaimer constant for UI presentation', () => {
      expect(MEDICAL_DISCLAIMER).toContain('does not provide medical diagnosis');
    });
  });
});
