import { Location } from '../domain/types';
import {
  EnvironmentalContextResult,
  IAirQualityProvider,
  IEnvironmentService,
  IWeatherProvider,
} from './types';
import { SAFE_FALLBACK_AIR_QUALITY, SAFE_FALLBACK_WEATHER } from './mockData';

export class EnvironmentService implements IEnvironmentService {
  constructor(
    private airQualityProvider: IAirQualityProvider,
    private weatherProvider: IWeatherProvider
  ) {}

  public async getEnvironmentalContext(
    location: Location,
    forceFallback = false
  ): Promise<EnvironmentalContextResult> {
    if (forceFallback) {
      return {
        airQuality: {
          ...SAFE_FALLBACK_AIR_QUALITY,
          timestamp: new Date().toISOString(),
        },
        weather: {
          ...SAFE_FALLBACK_WEATHER,
          timestamp: new Date().toISOString(),
        },
        isFallback: true,
        fallbackReason: 'User initiated fallback simulation mode.',
      };
    }

    try {
      const [airQuality, weather] = await Promise.all([
        this.airQualityProvider.getAirQuality(location),
        this.weatherProvider.getWeather(location),
      ]);

      return {
        airQuality,
        weather,
        isFallback: airQuality.isStaleOrFallback ?? false,
        fallbackReason: airQuality.isStaleOrFallback
          ? 'Sensor data for requested coordinates is unavailable or historical; using safe baseline.'
          : undefined,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown telemetry error';
      // Graceful fallback on any network or provider failure
      return {
        airQuality: {
          ...SAFE_FALLBACK_AIR_QUALITY,
          timestamp: new Date().toISOString(),
          isStaleOrFallback: true,
        },
        weather: {
          ...SAFE_FALLBACK_WEATHER,
          timestamp: new Date().toISOString(),
        },
        isFallback: true,
        fallbackReason: `Data provider connection failed (${errorMessage}). Reverted to conservative safety baseline.`,
      };
    }
  }
}
