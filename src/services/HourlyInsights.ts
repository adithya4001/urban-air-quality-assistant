import type { Location } from '../domain/types';

export type HourlyPoint = { time: string; aqi: number | null; pm25: number | null; pm10: number | null; temperature: number | null; humidity: number | null; wind: number | null };
type Series = { time?: string[]; [key: string]: unknown };
type ApiResponse = { timezone?: string; current?: { time?: string }; hourly?: Series };
const numberAt = (series: Series, key: string, index: number): number | null => {
  const values = series[key];
  const value = Array.isArray(values) ? values[index] : null;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

export function combineHourly(air: ApiResponse, weather: ApiResponse): { points: HourlyPoint[]; timezone: string; currentTime: string } {
  if (!air.hourly?.time?.length || !weather.hourly?.time?.length) throw new Error('Hourly forecast is unavailable.');
  const a = air.hourly; const w = weather.hourly;
  const weatherIndex = new Map(w.time!.map((time, index) => [time, index]));
  const currentTime = air.current?.time || weather.current?.time;
  if (!currentTime) throw new Error('Forecast timestamp is unavailable.');
  const hour = currentTime.slice(0, 13);
  const currentIndex = a.time!.findIndex(time => time.slice(0, 13) === hour);
  if (currentIndex < 0) throw new Error('Current hour was not found in the forecast.');
  const points = a.time!.slice(Math.max(0, currentIndex - 6), currentIndex + 18).flatMap((time, offset) => {
    const i = Math.max(0, currentIndex - 6) + offset; const j = weatherIndex.get(time);
    if (j === undefined) return [];
    return [{ time, aqi: numberAt(a, 'us_aqi', i), pm25: numberAt(a, 'pm2_5', i), pm10: numberAt(a, 'pm10', i), temperature: numberAt(w, 'temperature_2m', j), humidity: numberAt(w, 'relative_humidity_2m', j), wind: numberAt(w, 'wind_speed_10m', j) }];
  });
  if (!points.length) throw new Error('Hourly data could not be matched.');
  return { points, timezone: air.timezone || weather.timezone || 'local time', currentTime };
}

export async function fetchHourlyInsights(location: Location, signal?: AbortSignal) {
  const query = new URLSearchParams({ latitude: String(location.coordinates.latitude), longitude: String(location.coordinates.longitude), timezone: 'auto', past_days: '1', forecast_days: '2' });
  const airQuery = new URLSearchParams(query); airQuery.set('hourly', 'us_aqi,pm2_5,pm10'); airQuery.set('current', 'us_aqi');
  const weatherQuery = new URLSearchParams(query); weatherQuery.set('hourly', 'temperature_2m,relative_humidity_2m,wind_speed_10m'); weatherQuery.set('current', 'temperature_2m');
  const [air, weather] = await Promise.all([
    fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${airQuery}`, { signal }),
    fetch(`https://api.open-meteo.com/v1/forecast?${weatherQuery}`, { signal }),
  ]);
  if (!air.ok || !weather.ok) throw new Error('The hourly data provider is temporarily unavailable.');
  return combineHourly(await air.json() as ApiResponse, await weather.json() as ApiResponse);
}
