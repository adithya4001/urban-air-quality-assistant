import { Location, WeatherSnapshot } from '../domain/types';
import { assertFiniteNumber, directionFromDegrees, estimateInversionRisk, weatherConditionFromCode } from './liveUtils';
import { IWeatherProvider } from './types';

interface OpenMeteoWeatherResponse {
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    weather_code?: number;
  };
}

export class OpenMeteoWeatherProvider implements IWeatherProvider {
  public readonly providerName = 'Open-Meteo Weather (live)';

  public async getWeather(location: Location): Promise<WeatherSnapshot> {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(location.coordinates.latitude));
    url.searchParams.set('longitude', String(location.coordinates.longitude));
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code');
    url.searchParams.set('timezone', 'auto');

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Weather service returned HTTP ${response.status}.`);
    const payload = await response.json() as OpenMeteoWeatherResponse;
    const current = payload.current;
    if (!current) throw new Error('Weather service returned no current values.');

    const temperatureC = assertFiniteNumber(current.temperature_2m, 'temperature');
    const humidityPercent = assertFiniteNumber(current.relative_humidity_2m, 'humidity');
    const windSpeedKmh = assertFiniteNumber(current.wind_speed_10m, 'wind speed');
    const windDirection = directionFromDegrees(assertFiniteNumber(current.wind_direction_10m, 'wind direction'));
    const condition = weatherConditionFromCode(assertFiniteNumber(current.weather_code, 'weather code'));
    const inversionRisk = estimateInversionRisk(Boolean(location.isValleyOrBasin), windSpeedKmh, temperatureC, humidityPercent);

    return {
      timestamp: current.time ?? new Date().toISOString(),
      temperatureC: Math.round(temperatureC * 10) / 10,
      humidityPercent: Math.round(humidityPercent),
      windSpeedKmh: Math.round(windSpeedKmh * 10) / 10,
      windDirection,
      condition,
      inversionRisk,
      forecastSummary: inversionRisk === 'severe'
        ? 'Live weather suggests stagnant, cold air over this basin; pollution can accumulate near the surface.'
        : inversionRisk === 'moderate'
          ? 'Live weather suggests limited dispersion; use the exposure controls below until winds improve.'
          : 'Live weather conditions are being used to time outdoor activity and ventilation guidance.',
    };
  }
}
