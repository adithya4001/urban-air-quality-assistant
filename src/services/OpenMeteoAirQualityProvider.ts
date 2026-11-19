import { AirQualitySnapshot, Location } from '../domain/types';
import { assertFiniteNumber, riskLevelFromAqi } from './liveUtils';
import { IAirQualityProvider } from './types';

interface OpenMeteoAirQualityResponse {
  current?: {
    time?: string;
    us_aqi?: number;
    pm2_5?: number;
    pm10?: number;
  };
}

export class OpenMeteoAirQualityProvider implements IAirQualityProvider {
  public readonly providerName = 'Open-Meteo Air Quality (live forecast)';

  public async getAirQuality(location: Location): Promise<AirQualitySnapshot> {
    const url = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
    url.searchParams.set('latitude', String(location.coordinates.latitude));
    url.searchParams.set('longitude', String(location.coordinates.longitude));
    url.searchParams.set('current', 'us_aqi,pm2_5,pm10');
    url.searchParams.set('timezone', 'auto');

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Air-quality service returned HTTP ${response.status}.`);
    const payload = await response.json() as OpenMeteoAirQualityResponse;
    const current = payload.current;
    if (!current) throw new Error('Air-quality service returned no current values.');

    // Keep the risk thresholds aligned with the US AQI bands used by the deterministic engine.
    // If that field is unavailable, EnvironmentService will show a labelled safe fallback.
    const aqi = assertFiniteNumber(current.us_aqi, 'US AQI');
    const pm25 = assertFiniteNumber(current.pm2_5, 'PM2.5');
    const pm10 = assertFiniteNumber(current.pm10, 'PM10');

    return {
      timestamp: current.time ?? new Date().toISOString(),
      aqi: Math.max(0, Math.round(aqi)),
      primaryPollutant: 'PM2.5',
      pm25: Math.max(0, pm25),
      pm10: Math.max(0, pm10),
      riskLevel: riskLevelFromAqi(aqi),
      isStaleOrFallback: false,
    };
  }
}
