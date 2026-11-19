import { AirQualitySnapshot, Location, WeatherSnapshot } from '../domain/types';

export const MOCK_LOCATIONS: Location[] = [
  {
    id: 'loc-delhi',
    name: 'New Delhi (Connaught Place)',
    city: 'Delhi',
    country: 'India',
    coordinates: { latitude: 28.6315, longitude: 77.2167 },
    elevationMeters: 216,
    isValleyOrBasin: true,
  },
  {
    id: 'loc-ulaanbaatar',
    name: 'Ulaanbaatar (Sukhbaatar District)',
    city: 'Ulaanbaatar',
    country: 'Mongolia',
    coordinates: { latitude: 47.9212, longitude: 106.9186 },
    elevationMeters: 1350,
    isValleyOrBasin: true,
  },
  {
    id: 'loc-slc',
    name: 'Salt Lake City (Downtown Basin)',
    city: 'Salt Lake City',
    country: 'United States',
    coordinates: { latitude: 40.7608, longitude: -111.891 },
    elevationMeters: 1288,
    isValleyOrBasin: true,
  },
  {
    id: 'loc-london',
    name: 'London (Marylebone Road)',
    city: 'London',
    country: 'United Kingdom',
    coordinates: { latitude: 51.5225, longitude: -0.1548 },
    elevationMeters: 35,
    isValleyOrBasin: false,
  },
  {
    id: 'loc-zurich',
    name: 'Zurich (Lake Promenade)',
    city: 'Zurich',
    country: 'Switzerland',
    coordinates: { latitude: 47.3686, longitude: 8.5392 },
    elevationMeters: 408,
    isValleyOrBasin: false,
  },
];

export const MOCK_AIR_QUALITY_MAP: Record<string, AirQualitySnapshot> = {
  'loc-delhi': {
    timestamp: new Date().toISOString(),
    aqi: 388,
    primaryPollutant: 'PM2.5',
    pm25: 338.4,
    pm10: 480.2,
    no2: 82,
    riskLevel: 'hazardous',
    indoorAqiEstimate: 195,
    dominantSource: 'biomass_burning',
    isStaleOrFallback: false,
  },
  'loc-ulaanbaatar': {
    timestamp: new Date().toISOString(),
    aqi: 312,
    primaryPollutant: 'PM2.5',
    pm25: 262.1,
    pm10: 390.5,
    riskLevel: 'hazardous',
    indoorAqiEstimate: 140,
    dominantSource: 'biomass_burning',
    isStaleOrFallback: false,
  },
  'loc-slc': {
    timestamp: new Date().toISOString(),
    aqi: 132,
    primaryPollutant: 'PM2.5',
    pm25: 48.0,
    pm10: 65.4,
    riskLevel: 'unhealthy_sensitive',
    indoorAqiEstimate: 45,
    dominantSource: 'dust_inversion',
    isStaleOrFallback: false,
  },
  'loc-london': {
    timestamp: new Date().toISOString(),
    aqi: 68,
    primaryPollutant: 'NO2',
    pm25: 18.2,
    pm10: 32.1,
    no2: 44,
    riskLevel: 'moderate',
    indoorAqiEstimate: 30,
    dominantSource: 'vehicular',
    isStaleOrFallback: false,
  },
  'loc-zurich': {
    timestamp: new Date().toISOString(),
    aqi: 24,
    primaryPollutant: 'PM2.5',
    pm25: 5.8,
    pm10: 10.2,
    riskLevel: 'low',
    indoorAqiEstimate: 15,
    dominantSource: 'industrial',
    isStaleOrFallback: false,
  },
};

export const MOCK_WEATHER_MAP: Record<string, WeatherSnapshot> = {
  'loc-delhi': {
    timestamp: new Date().toISOString(),
    temperatureC: 13,
    humidityPercent: 88,
    windSpeedKmh: 3.2,
    windDirection: 'NW',
    condition: 'inversion',
    inversionRisk: 'severe',
    forecastSummary:
      'Dense winter fog layer with persistent nocturnal thermal inversion. Calm winds (<4 km/h) preventing dispersion.',
  },
  'loc-ulaanbaatar': {
    timestamp: new Date().toISOString(),
    temperatureC: -19,
    humidityPercent: 74,
    windSpeedKmh: 4.1,
    windDirection: 'NE',
    condition: 'smog',
    inversionRisk: 'severe',
    forecastSummary:
      'Sub-zero valley stagnation trapping dense coal and wood smoke in low-lying residential ger districts.',
  },
  'loc-slc': {
    timestamp: new Date().toISOString(),
    temperatureC: -2,
    humidityPercent: 68,
    windSpeedKmh: 6.5,
    windDirection: 'SW',
    condition: 'inversion',
    inversionRisk: 'moderate',
    forecastSummary:
      'High-pressure ridge creating multi-day valley temperature inversion cap over Wasatch Front.',
  },
  'loc-london': {
    timestamp: new Date().toISOString(),
    temperatureC: 7,
    humidityPercent: 82,
    windSpeedKmh: 14.8,
    windDirection: 'W',
    condition: 'overcast',
    inversionRisk: 'none',
    forecastSummary:
      'Overcast winter day with gentle westerly breeze promoting moderate vertical mixing.',
  },
  'loc-zurich': {
    timestamp: new Date().toISOString(),
    temperatureC: 4,
    humidityPercent: 62,
    windSpeedKmh: 18.2,
    windDirection: 'NE',
    condition: 'clear',
    inversionRisk: 'none',
    forecastSummary:
      'Brisk alpine breeze and clear skies providing excellent atmospheric clearing and dispersion.',
  },
};

/**
 * Safe, conservative fallback data used whenever network requests fail,
 * sensors are offline, or location is unknown.
 */
export const SAFE_FALLBACK_LOCATION: Location = {
  id: 'loc-fallback-default',
  name: 'Urban Area (Default Safety Fallback)',
  city: 'General Metropolitan',
  country: 'Global',
  coordinates: { latitude: 0, longitude: 0 },
  isValleyOrBasin: false,
};

export const SAFE_FALLBACK_AIR_QUALITY: AirQualitySnapshot = {
  timestamp: new Date().toISOString(),
  aqi: 110,
  primaryPollutant: 'PM2.5',
  pm25: 39.5,
  pm10: 60.0,
  riskLevel: 'unhealthy_sensitive',
  indoorAqiEstimate: 50,
  dominantSource: 'vehicular',
  isStaleOrFallback: true,
};

export const SAFE_FALLBACK_WEATHER: WeatherSnapshot = {
  timestamp: new Date().toISOString(),
  temperatureC: 8,
  humidityPercent: 75,
  windSpeedKmh: 5.0,
  windDirection: 'Variable',
  condition: 'fog',
  inversionRisk: 'moderate',
  forecastSummary:
    'Sensor telemetry unavailable. Operating under precautionary winter baseline with presumed moderate atmospheric stagnation.',
};
