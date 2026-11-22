import { describe, expect, it } from 'vitest';
import { combineHourly } from '../services/HourlyInsights';

describe('hourly insights', () => {
  it('joins air and weather by local timestamp without inventing missing values', () => {
    const air = { timezone: 'Asia/Kolkata', current: { time: '2026-11-22T10:30' }, hourly: { time: ['2026-11-22T09:00', '2026-11-22T10:00', '2026-11-22T11:00'], us_aqi: [80, 120, null], pm2_5: [20, 35, 40], pm10: [35, 50, 60] } };
    const weather = { timezone: 'Asia/Kolkata', current: { time: '2026-11-22T10:30' }, hourly: { time: ['2026-11-22T10:00', '2026-11-22T11:00'], temperature_2m: [25, 26], relative_humidity_2m: [50, null], wind_speed_10m: [4, 5] } };
    const result = combineHourly(air, weather);
    expect(result.timezone).toBe('Asia/Kolkata');
    expect(result.points).toHaveLength(2);
    expect(result.points[0]).toMatchObject({ time: '2026-11-22T10:00', aqi: 120, temperature: 25 });
    expect(result.points[1]).toMatchObject({ aqi: null, humidity: null });
  });
  it('reports unavailable timestamps instead of showing sample readings', () => {
    expect(() => combineHourly({ hourly: { time: ['2026-11-22T10:00'] } }, { hourly: { time: ['2026-11-22T10:00'] } })).toThrow('timestamp');
  });
});
