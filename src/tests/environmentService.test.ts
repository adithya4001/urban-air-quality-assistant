import { describe, expect, it, vi } from 'vitest';
import { EnvironmentService } from '../services/EnvironmentService';
import { MOCK_AIR_QUALITY_MAP, MOCK_LOCATIONS, MOCK_WEATHER_MAP } from '../services/mockData';

describe('environment service provider and fallback behavior', () => {
  const location = MOCK_LOCATIONS[0];

  it('keeps the live signal and labels only the missing signal as fallback', async () => {
    const air = MOCK_AIR_QUALITY_MAP[location.id];
    const weather = MOCK_WEATHER_MAP[location.id];
    const service = new EnvironmentService(
      { providerName: 'live air test', getAirQuality: vi.fn().mockResolvedValue(air) },
      { providerName: 'live weather test', getWeather: vi.fn().mockRejectedValue(new Error('weather timeout')) },
      { providerName: 'fallback air test', getAirQuality: vi.fn() },
      { providerName: 'fallback weather test', getWeather: vi.fn().mockResolvedValue(weather) },
    );

    const result = await service.getEnvironmentalContext(location);

    expect(result.airQuality).toBe(air);
    expect(result.weather).toBe(weather);
    expect(result.isFallback).toBe(true);
    expect(result.dataSource).toBe('mixed');
    expect(result.fallbackReason).toContain('weather timeout');
    expect(result.dataAttribution).toContain('missing signals');
  });

  it('returns clearly attributed conservative data when fallback mode is requested', async () => {
    const airProvider = { providerName: 'live air test', getAirQuality: vi.fn() };
    const weatherProvider = { providerName: 'live weather test', getWeather: vi.fn() };
    const service = new EnvironmentService(airProvider, weatherProvider);

    const result = await service.getEnvironmentalContext(location, true);

    expect(result.isFallback).toBe(true);
    expect(result.dataSource).toBe('fallback');
    expect(result.fallbackReason).toContain('simulation');
    expect(result.dataAttribution).toContain('intentionally paused');
    expect(airProvider.getAirQuality).not.toHaveBeenCalled();
    expect(weatherProvider.getWeather).not.toHaveBeenCalled();
  });
});
