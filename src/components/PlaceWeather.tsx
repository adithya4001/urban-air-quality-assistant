import { useState } from 'react';

export type PlaceForecast = {
  current?: { temperature_2m?: number; wind_speed_10m?: number; relative_humidity_2m?: number; weather_code?: number; time?: string };
  hourly?: { time?: string[]; temperature_2m?: (number | null)[]; precipitation_probability?: (number | null)[]; wind_speed_10m?: (number | null)[] };
  daily?: { time?: string[]; weather_code?: (number | null)[]; temperature_2m_max?: (number | null)[]; temperature_2m_min?: (number | null)[] };
};
type Metric = 'temperature' | 'precipitation' | 'wind';
const metrics: Record<Metric, { label: string; unit: string; key: 'temperature_2m' | 'precipitation_probability' | 'wind_speed_10m' }> = {
  temperature: { label: 'Temperature', unit: '°C', key: 'temperature_2m' }, precipitation: { label: 'Rain chance', unit: '%', key: 'precipitation_probability' }, wind: { label: 'Wind', unit: 'km/h', key: 'wind_speed_10m' },
};
function weather(code: number | null | undefined) {
  if (code == null) return { icon:'◌', label:'Conditions unavailable' };
  if (code === 0) return { icon:'☀️', label:'Clear' };
  if (code <= 2) return { icon:'🌤️', label:'Partly cloudy' };
  if (code === 3) return { icon:'☁️', label:'Overcast' };
  if (code === 45 || code === 48) return { icon:'🌫️', label:'Fog' };
  if (code >= 95) return { icon:'⛈️', label:'Thunderstorm' };
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return { icon:'🌨️', label:'Snow' };
  if (code >= 51 && code <= 82) return { icon:'🌧️', label:'Rain' };
  return { icon:'◌', label:'Conditions unavailable' };
}
const formatValue = (value: number | null | undefined, suffix = '') => value == null || !Number.isFinite(value) ? '—' : `${Math.round(value)}${suffix}`;
function dayName(date: string) { const d = new Date(`${date}T12:00:00`); return Number.isNaN(d.valueOf()) ? date : d.toLocaleDateString('en-IN', { weekday: 'short' }); }

export function PlaceWeather({ label, name, forecast }: { label: string; name: string; forecast: PlaceForecast }) {
  const [metric, setMetric] = useState<Metric>('temperature');
  const [day, setDay] = useState(0);
  const { current, hourly, daily } = forecast;
  const selectedDate = daily?.time?.[day];
  const nowHour = current?.time?.slice(0, 13);
  const hours = (hourly?.time || []).map((time, index) => ({ time, value: hourly?.[metrics[metric].key]?.[index] })).filter(item => item.time.startsWith(selectedDate || '') && (day !== 0 || !nowHour || item.time.slice(0, 13) >= nowHour)).filter((_, index) => index % 3 === 0).slice(0, 8);
  const valid = hours.map(x => x.value).filter((x): x is number => typeof x === 'number' && Number.isFinite(x));
  const low = Math.min(...valid), high = Math.max(...valid);
  const points = hours.map((item, index) => { if (item.value == null || !Number.isFinite(item.value)) return null; const x = hours.length < 2 ? 50 : (index / (hours.length - 1)) * 100; const y = high === low ? 50 : 75 - ((item.value - low) / (high - low)) * 50; return { x, y, value:item.value, time:item.time }; }).filter((p): p is {x:number;y:number;value:number;time:string} => p !== null);
  const contiguous = points.length === hours.length;
  const currentIndex = (hourly?.time || []).findIndex(t => t.slice(0, 13) === nowHour);
  const chance = currentIndex >= 0 ? hourly?.precipitation_probability?.[currentIndex] : undefined;
  const condition = weather(current?.weather_code);
  return <article className="place-weather"><header className="place-weather-header"><div><span className="place-weather-label">{label}</span><h4>{name}</h4><p>Updated {current?.time?.replace('T', ' ') || 'time unavailable'} · local time</p></div><div className="place-weather-condition"><span aria-hidden="true">{condition.icon}</span><div><strong>{formatValue(current?.temperature_2m, '°C')}</strong><small>{condition.label}</small></div></div></header><div className="place-weather-stats"><span>Rain chance <b>{formatValue(chance,'%')}</b></span><span>Humidity <b>{formatValue(current?.relative_humidity_2m,'%')}</b></span><span>Wind <b>{formatValue(current?.wind_speed_10m,' km/h')}</b></span></div><div className="weather-metric-tabs" role="group" aria-label="Forecast metric">{(Object.keys(metrics) as Metric[]).map(m=><button key={m} type="button" className={metric===m?'active':''} aria-pressed={metric===m} onClick={()=>setMetric(m)}>{metrics[m].label}</button>)}</div><div className="weather-chart" aria-label={`${metrics[metric].label} forecast for ${selectedDate || 'selected day'}`}>
    {points.length > 0 && contiguous ? <svg viewBox="-5 0 110 100" preserveAspectRatio="none" aria-hidden="true"><path d={`M ${points.map(p=>`${p.x} ${p.y}`).join(' L ')} L ${points[points.length-1].x} 100 L ${points[0].x} 100 Z`} className="weather-chart-fill"/><polyline points={points.map(p=>`${p.x},${p.y}`).join(' ')} className="weather-chart-line"/></svg> : <p className="weather-chart-empty">Hourly forecast unavailable for this day.</p>}
    <div className="weather-chart-values">{hours.map((item,i)=><div key={item.time}><strong>{formatValue(item.value,metrics[metric].unit)}</strong><small>{item.time.slice(11,16)}</small><span className="sr-only">{metrics[metric].label} at {item.time}: {formatValue(item.value,metrics[metric].unit)}</span></div>)}</div></div><div className="weather-day-list" aria-label="Daily forecast">{(daily?.time || []).map((date,i)=>{const conditionDay=weather(daily?.weather_code?.[i]);return <button type="button" key={date} className={day===i?'selected':''} aria-pressed={day===i} aria-label={`${date}, ${conditionDay.label}, high ${formatValue(daily?.temperature_2m_max?.[i], '°C')}, low ${formatValue(daily?.temperature_2m_min?.[i], '°C')}`} onClick={()=>setDay(i)}><span>{dayName(date)}</span><span className="weather-day-icon" aria-hidden="true">{conditionDay.icon}</span><span>{formatValue(daily?.temperature_2m_max?.[i],'°')} <small>{formatValue(daily?.temperature_2m_min?.[i],'°')}</small></span></button>})}</div><p className="weather-source">Forecast: Open-Meteo · Times are local to this place</p></article>;
}
