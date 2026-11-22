/**
 * Domain types for Urban Air Quality Assistant
 * Standardized across environmental data providers, recommendation engine, and UI.
 */

export type RiskLevel =
  | 'low'                  // AQI 0-50 (Good)
  | 'moderate'             // AQI 51-100 (Moderate)
  | 'unhealthy_sensitive'  // AQI 101-150 (Unhealthy for Sensitive Groups)
  | 'unhealthy'            // AQI 151-200 (Unhealthy)
  | 'very_unhealthy'       // AQI 201-300 (Very Unhealthy)
  | 'hazardous';           // AQI 301+ (Hazardous / Severe Winter Smog)

export type DataSource = 'live' | 'mixed' | 'scenario' | 'fallback';

export type PrimaryPollutant = 'PM2.5' | 'PM10' | 'NO2' | 'O3' | 'CO' | 'SO2';

export interface Location {
  id: string;
  name: string;
  city: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  elevationMeters?: number;
  isValleyOrBasin?: boolean; // Valley basins are prone to severe winter temperature inversions
}

export type AgeGroup = 'infant_child' | 'teen_adult' | 'older_adult';

export type HealthCondition =
  | 'asthma'
  | 'copd'
  | 'cardiovascular'
  | 'pregnancy'
  | 'allergies'
  | 'none';

export type CommuteMode = 'walking' | 'cycling' | 'transit' | 'car' | 'wfh';

export type HomeHeatingType = 'electric_heatpump' | 'natural_gas' | 'wood_biomass' | 'district_steam';

export interface UserProfile {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  healthConditions: HealthCondition[];
  lifestyle: {
    commuteMode: CommuteMode;
    commuteDurationMinutes: number;
    outdoorActivityLevel: 'low' | 'moderate' | 'high';
    homeHeatingType: HomeHeatingType;
  };
  hasAirPurifier: boolean;
  hasN95Masks: boolean;
}

export type WeatherCondition = 'clear' | 'fog' | 'smog' | 'rain' | 'overcast' | 'inversion';

export type InversionRisk = 'none' | 'moderate' | 'severe';

export interface WeatherSnapshot {
  timestamp: string; // ISO 8601
  temperatureC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  windDirection: string;
  condition: WeatherCondition;
  inversionRisk: InversionRisk;
  forecastSummary: string;
}

export interface AirQualitySnapshot {
  timestamp: string; // ISO 8601
  aqi: number;
  primaryPollutant?: PrimaryPollutant;
  pm25: number;       // ug/m3
  pm10: number;       // ug/m3
  no2?: number;       // ppb
  riskLevel: RiskLevel;
  indoorAqiEstimate?: number;
  dominantSource?: 'biomass_burning' | 'vehicular' | 'industrial' | 'dust_inversion';
  isStaleOrFallback?: boolean;
}

export type RecommendationCategory =
  | 'outdoor_activity'
  | 'commute'
  | 'indoor_air'
  | 'emission_reduction'
  | 'protective_equipment';

export interface Recommendation {
  id: string;
  category: RecommendationCategory;
  title: string;
  summary: string;
  actionItems: string[];
  healthImpact: string;
  environmentalImpact: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  safetyNotice?: string;
  sourceGuidance: string; // E.g., 'WHO Air Quality Guidelines 2021 / EPA AQI Standards'
}

export interface DailyPlan {
  date: string;
  location: Location;
  userProfile: UserProfile;
  overallRisk: RiskLevel;
  weather: WeatherSnapshot;
  airQuality: AirQualitySnapshot;
  recommendations: Recommendation[];
  fallbackActive: boolean;
  fallbackReason?: string;
  dataSource?: DataSource;
  dataAttribution?: string;
  generatedAt: string;
}
