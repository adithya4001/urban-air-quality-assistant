import { Location } from '../domain/types';
import {
  EnvironmentalContextResult,
  IAirQualityProvider,
  IEnvironmentService,
  IWeatherProvider,
} from './types';
import { MockAirQualityProvider } from './MockAirQualityProvider';
import { MockWeatherProvider } from './MockWeatherProvider';
import { SAFE_FALLBACK_AIR_QUALITY, SAFE_FALLBACK_WEATHER } from './mockData';

export class EnvironmentService implements IEnvironmentService {
  constructor(
    private airQualityProvider: IAirQualityProvider,
    private weatherProvider: IWeatherProvider,
    private fallbackAirQualityProvider: IAirQualityProvider = new MockAirQualityProvider({ simulateDelayMs: 0 }),
    private fallbackWeatherProvider: IWeatherProvider = new MockWeatherProvider({ simulateDelayMs: 0 }),
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
        dataSource: 'fallback',
        dataAttribution: 'Conservative safety baseline; live providers intentionally paused.',
      };
    }

    const [airResult, weatherResult] = await Promise.allSettled([
      this.airQualityProvider.getAirQuality(location),
      this.weatherProvider.getWeather(location),
    ]);

    const reasons: string[] = [];
    let airQuality = airResult.status === 'fulfilled' ? airResult.value : undefined;
    let weather = weatherResult.status === 'fulfilled' ? weatherResult.value : undefined;

    if (!airQuality) {
      const reason = airResult.status === 'rejected' && airResult.reason instanceof Error
        ? airResult.reason.message
        : 'unknown air-quality error';
      reasons.push(`Air quality unavailable (${reason})`);
      try {
        airQuality = await this.fallbackAirQualityProvider.getAirQuality(location);
      } catch {
        airQuality = { ...SAFE_FALLBACK_AIR_QUALITY, timestamp: new Date().toISOString() };
      }
      airQuality = { ...airQuality, isStaleOrFallback: true };
    }

    if (!weather) {
      const reason = weatherResult.status === 'rejected' && weatherResult.reason instanceof Error
        ? weatherResult.reason.message
        : 'unknown weather error';
      reasons.push(`Weather unavailable (${reason})`);
      try {
        weather = await this.fallbackWeatherProvider.getWeather(location);
      } catch {
        weather = { ...SAFE_FALLBACK_WEATHER, timestamp: new Date().toISOString() };
      }
    }

    const usedFallback = reasons.length > 0 || Boolean(airQuality.isStaleOrFallback);
    return {
      airQuality,
      weather,
      isFallback: usedFallback,
      fallbackReason: usedFallback
        ? `${reasons.join('. ')}${reasons.length ? '. ' : ''}Using a labelled safety baseline for the missing signal.`
        : undefined,
      dataSource: usedFallback ? (reasons.length === 2 ? 'fallback' : 'mixed') : 'live',
      dataAttribution: usedFallback
        ? 'Live Open-Meteo data is used where available; missing signals use clearly labelled scenario fallback data.'
        : 'Live data: Open-Meteo weather and CAMS ENSEMBLE air-quality forecast.',
    };
  }
}
