import { InversionRisk, RiskLevel, WeatherCondition } from '../domain/types';

export function riskLevelFromAqi(aqi: number): RiskLevel {
  if (aqi <= 50) return 'low';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy_sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very_unhealthy';
  return 'hazardous';
}

export function directionFromDegrees(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % directions.length];
}

export function weatherConditionFromCode(code: number): WeatherCondition {
  if (code === 0 || code === 1) return 'clear';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 82) return 'rain';
  return 'overcast';
}

export function estimateInversionRisk(
  isValleyOrBasin: boolean,
  windSpeedKmh: number,
  temperatureC: number,
  humidityPercent: number,
): InversionRisk {
  if (isValleyOrBasin && windSpeedKmh < 3 && temperatureC <= 8) return 'severe';
  if ((isValleyOrBasin && windSpeedKmh < 6 && temperatureC <= 12) || (windSpeedKmh < 4 && humidityPercent > 80)) {
    return 'moderate';
  }
  return 'none';
}

export function assertFiniteNumber(value: unknown, label: string): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) throw new Error(`Open-Meteo response missing ${label}.`);
  return number;
}
