import { Location, WeatherSnapshot } from '../domain/types';
import { IWeatherProvider } from './types';
import { MOCK_WEATHER_MAP, SAFE_FALLBACK_WEATHER } from './mockData';

export class MockWeatherProvider implements IWeatherProvider {
  public readonly providerName = 'MockWeatherProvider (Atmospheric Dynamics)';

  private simulateDelayMs: number;
  private shouldFail: boolean;

  constructor(options?: { simulateDelayMs?: number; shouldFail?: boolean }) {
    this.simulateDelayMs = options?.simulateDelayMs ?? 150;
    this.shouldFail = options?.shouldFail ?? false;
  }

  public setShouldFail(fail: boolean): void {
    this.shouldFail = fail;
  }

  public async getWeather(location: Location): Promise<WeatherSnapshot> {
    if (this.simulateDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.simulateDelayMs));
    }

    if (this.shouldFail) {
      throw new Error(`Meteorological station offline for location: ${location.id}`);
    }

    const recorded = MOCK_WEATHER_MAP[location.id];
    if (!recorded) {
      return {
        ...SAFE_FALLBACK_WEATHER,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      ...recorded,
      timestamp: new Date().toISOString(),
    };
  }
}
