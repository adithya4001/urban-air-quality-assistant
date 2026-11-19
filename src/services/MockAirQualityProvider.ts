import { AirQualitySnapshot, Location } from '../domain/types';
import { IAirQualityProvider } from './types';
import { MOCK_AIR_QUALITY_MAP, SAFE_FALLBACK_AIR_QUALITY } from './mockData';

export class MockAirQualityProvider implements IAirQualityProvider {
  public readonly providerName = 'MockAirQualityProvider (Simulation & Fallback)';

  private simulateDelayMs: number;
  private shouldFail: boolean;

  constructor(options?: { simulateDelayMs?: number; shouldFail?: boolean }) {
    this.simulateDelayMs = options?.simulateDelayMs ?? 150;
    this.shouldFail = options?.shouldFail ?? false;
  }

  public setShouldFail(fail: boolean): void {
    this.shouldFail = fail;
  }

  public async getAirQuality(location: Location): Promise<AirQualitySnapshot> {
    if (this.simulateDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.simulateDelayMs));
    }

    if (this.shouldFail) {
      throw new Error(`Air quality sensor network error for location: ${location.id}`);
    }

    const recorded = MOCK_AIR_QUALITY_MAP[location.id];
    if (!recorded) {
      // Return safe fallback for unknown location
      return {
        ...SAFE_FALLBACK_AIR_QUALITY,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      ...recorded,
      timestamp: new Date().toISOString(),
    };
  }
}
