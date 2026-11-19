import { afterEach, describe, expect, it, vi } from 'vitest';
import { MOCK_LOCATIONS } from '../services/mockData';
import { OpenMeteoAirQualityProvider } from '../services/OpenMeteoAirQualityProvider';
import { OpenMeteoWeatherProvider } from '../services/OpenMeteoWeatherProvider';
import { directionFromDegrees, riskLevelFromAqi, weatherConditionFromCode } from '../services/liveUtils';

afterEach(() => vi.unstubAllGlobals());

describe('live environmental providers', () => {
  it('maps AQI thresholds into deterministic risk bands', () => {
    expect(riskLevelFromAqi(50)).toBe('low');
    expect(riskLevelFromAqi(101)).toBe('unhealthy_sensitive');
    expect(riskLevelFromAqi(301)).toBe('hazardous');
  });

  it('maps weather primitives into user-readable values', () => {
    expect(directionFromDegrees(315)).toBe('NW');
    expect(weatherConditionFromCode(45)).toBe('fog');
    expect(weatherConditionFromCode(61)).toBe('rain');
  });

  it('normalizes Open-Meteo responses without leaking provider details into domain rules', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        current: { time: '2026-11-19T11:30', us_aqi: 164, pm2_5: 82.4, pm10: 83.6 },
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        current: {
          time: '2026-11-19T12:15',
          temperature_2m: 23,
          relative_humidity_2m: 49,
          wind_speed_10m: 4.6,
          wind_direction_10m: 315,
          weather_code: 0,
        },
      }), { status: 200 })));

    const location = MOCK_LOCATIONS[0];
    const air = await new OpenMeteoAirQualityProvider().getAirQuality(location);
    const weather = await new OpenMeteoWeatherProvider().getWeather(location);

    expect(air).toMatchObject({ aqi: 164, pm25: 82.4, pm10: 83.6, riskLevel: 'unhealthy' });
    expect(weather).toMatchObject({ temperatureC: 23, windDirection: 'NW', condition: 'clear' });
  });
});
