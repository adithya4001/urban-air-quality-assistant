import React, { useEffect, useState } from 'react';
import type { Location } from '../domain/types';
import { fetchHourlyInsights, type HourlyPoint } from '../services/HourlyInsights';
import './AirInsightsDashboard.css';

type Key = Exclude<keyof HourlyPoint, 'time'>;
const charts: { key: Key; title: string; unit: string; kind: 'line' | 'area' | 'bars'; color: string; description: string }[] = [
  { key: 'aqi', title: 'Air quality index', unit: 'US AQI', kind: 'line', color: '#178a78', description: 'Overall modelled outdoor air quality.' },
  { key: 'pm25', title: 'Fine particles', unit: 'µg/m³', kind: 'area', color: '#d18b4d', description: 'PM2.5 concentration by hour.' },
  { key: 'pm10', title: 'Coarse particles', unit: 'µg/m³', kind: 'bars', color: '#a77ca5', description: 'PM10 includes PM2.5; values overlap.' },
  { key: 'temperature', title: 'Temperature', unit: '°C', kind: 'line', color: '#d77c65', description: 'Air temperature at 2 metres.' },
  { key: 'wind', title: 'Wind speed', unit: 'km/h', kind: 'bars', color: '#729a69', description: 'Wind speed at 10 metres.' },
];

const bands = [
  { label: 'Good', max: 50, color: '#4a9b75' },
  { label: 'Moderate', max: 100, color: '#d2a737' },
  { label: 'Sensitive groups', max: 150, color: '#dd8849' },
  { label: 'Unhealthy', max: 200, color: '#cc615d' },
  { label: 'Very unhealthy', max: 300, color: '#946fa9' },
  { label: 'Hazardous', max: Infinity, color: '#85445c' },
];

function AqiDistribution({ points }: { points: HourlyPoint[] }) {
  const values = points.flatMap(p => p.aqi !== null && p.aqi >= 0 ? [p.aqi] : []);
  const counts = bands.map(b => ({ ...b, count: values.filter(v => bands.find(band => v <= band.max)?.label === b.label).length }));
  let offset = 0;
  return <article className="insight-chart"><div className="insight-chart-heading"><div><span className="insight-metric-unit">US AQI · selected hours</span><h3>Hours by air quality</h3></div><strong>{values.length}</strong></div><p>Number of available hourly estimates in each US AQI band. This is not a pollution breakdown.</p>{values.length ? <div className="insights-donut-layout"><svg viewBox="0 0 120 120" role="img" aria-label={`Distribution of ${values.length} hourly US AQI estimates. See legend for counts.`}><circle cx="60" cy="60" r="42" fill="none" stroke="#e9f0ec" strokeWidth="14" />{counts.map(b => { const fraction = b.count / values.length; const start = offset; offset += fraction; return fraction ? <circle key={b.label} cx="60" cy="60" r="42" pathLength="100" fill="none" stroke={b.color} strokeWidth="14" strokeDasharray={`${fraction * 100} ${100 - fraction * 100}`} strokeDashoffset={-start * 100} transform="rotate(-90 60 60)"><title>{b.label}: {b.count} hours</title></circle> : null; })}<text x="60" y="65" textAnchor="middle" fontSize="15" fill="#285c50">{values.length}h</text></svg><ul>{counts.filter(b => b.count > 0).map(b => <li key={b.label}><span style={{ background: b.color }} />{b.label}: {b.count}h</li>)}</ul></div> : <p>No AQI estimates are available.</p>}</article>;
}

function AirTemperatureScatter({ points }: { points: HourlyPoint[] }) {
  const samples = points.filter((p): p is HourlyPoint & { temperature: number; aqi: number } => p.temperature !== null && p.aqi !== null);
  if (!samples.length) return <article className="insight-chart"><h3>AQI and temperature</h3><p>Matching hourly data unavailable.</p></article>;
  const minT = Math.min(...samples.map(p => p.temperature)); const maxT = Math.max(...samples.map(p => p.temperature));
  const maxA = Math.max(1, ...samples.map(p => p.aqi));
  return <article className="insight-chart"><div className="insight-chart-heading"><div><span className="insight-metric-unit">Hourly pairs</span><h3>AQI and temperature</h3></div><strong>{samples.length}</strong></div><p>Each dot is one modelled hour. A pattern does not prove temperature caused the AQI.</p><svg viewBox="0 0 300 130" role="img" aria-label={`${samples.length} hourly temperature and US AQI pairs; see data table for values.`}><line x1="20" y1="108" x2="290" y2="108" stroke="#cfdfda"/><line x1="20" y1="8" x2="20" y2="108" stroke="#cfdfda"/>{samples.map(p => <circle key={p.time} cx={25 + (p.temperature - minT) / Math.max(1, maxT - minT) * 255} cy={108 - p.aqi / maxA * 94} r="3.5" fill="#498da0" opacity=".75"><title>{p.time.replace('T',' ')}: {p.temperature}°C, US AQI {p.aqi}</title></circle>)}<text x="20" y="125" fontSize="9" fill="#62847f">{minT}°C</text><text x="290" y="125" textAnchor="end" fontSize="9" fill="#62847f">{maxT}°C</text><text x="24" y="11" fontSize="9" fill="#62847f">AQI {maxA}</text></svg></article>;
}

function Chart({ points, metric, currentTime }: { points: HourlyPoint[]; metric: typeof charts[number]; currentTime: string }) {
  const vals = points.map(p => p[metric.key]); const valid = vals.filter((v): v is number => v !== null);
  if (!valid.length) return <article className="insight-chart"><h3>{metric.title}</h3><p>Data unavailable for this metric.</p></article>;
  const min = Math.min(0, ...valid); const max = Math.max(1, ...valid); const range = Math.max(1, max - min);
  const x = (i: number) => 8 + i * (284 / Math.max(1, points.length - 1));
  const y = (v: number) => 108 - ((v - min) / range) * 92;
  const segments: string[][] = []; let segment: string[] = [];
  vals.forEach((value, i) => { if (value === null) { if (segment.length) segments.push(segment); segment = []; } else segment.push(`${x(i)},${y(value)}`); });
  if (segment.length) segments.push(segment);
  const currentIndex = points.findIndex(p => p.time.slice(0, 13) === currentTime.slice(0, 13));
  const current = currentIndex >= 0 ? vals[currentIndex] : null;
  const label = (time: string) => `${time.slice(5, 10)} ${time.slice(11, 16)}`;
  return <article className="insight-chart"><div className="insight-chart-heading"><div><span className="insight-metric-unit">{metric.unit}</span><h3>{metric.title}</h3></div><strong>{current === null ? '—' : Math.round(current * 10) / 10}</strong></div><p>{metric.description}</p>
    <svg viewBox="0 0 300 130" role="img" aria-label={`${metric.title}, hourly model estimates from ${label(points[0].time)} to ${label(points[points.length - 1].time)}. See data table for values.`}>
      <line x1="8" y1="108" x2="292" y2="108" stroke="#cfdfda"/><line x1="8" y1="62" x2="292" y2="62" stroke="#e7efeb" strokeDasharray="3 5"/>
      {currentIndex >= 0 && <line x1={x(currentIndex)} y1="8" x2={x(currentIndex)} y2="108" stroke="#7a9992" strokeDasharray="3 4"/>}
      {metric.kind === 'bars' ? vals.map((v, i) => v === null ? null : <rect key={points[i].time} x={x(i) - 4} y={y(v)} width="8" height={Math.max(1, 108 - y(v))} rx="3" fill={metric.color} opacity=".8"><title>{`${label(points[i].time)}: ${v} ${metric.unit}`}</title></rect>) : segments.map((s, i) => <g key={i}>{metric.kind === 'area' && s.length > 1 && <polygon points={`${s[0].split(',')[0]},108 ${s.join(' ')} ${s[s.length - 1].split(',')[0]},108`} fill={metric.color} opacity=".14"/>}<polyline points={s.join(' ')} fill="none" stroke={metric.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/></g>)}
      <text x="8" y="125" fontSize="9" fill="#62847f">{label(points[0].time)}</text><text x="292" y="125" textAnchor="end" fontSize="9" fill="#62847f">{label(points[points.length - 1].time)}</text>
    </svg>
  </article>;
}

export function AirInsightsDashboard({ location, refreshNonce }: { location: Location; refreshNonce: number }) {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchHourlyInsights>> | null>(null);
  const [error, setError] = useState(''); const [updated, setUpdated] = useState<Date | null>(null); const [hourlyTick, setHourlyTick] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setHourlyTick(n => n + 1), 60 * 60 * 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { const controller = new AbortController(); setData(null); setError(''); fetchHourlyInsights(location, controller.signal).then(result => { setData(result); setUpdated(new Date()); }).catch(err => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Hourly data is unavailable.'); }); return () => controller.abort(); }, [location.coordinates.latitude, location.coordinates.longitude, refreshNonce, hourlyTick]);
  return <section className="insights-analytics" aria-label="Hourly air and weather analytics"><div className="insights-analytics-heading"><div><span className="daily-eyebrow">YOUR LOCATION · HOURLY</span><h2>See how your air changes</h2><p>Seven views of recent hours and the upcoming forecast for {location.name}. The dotted line marks the current hour.</p></div>{updated && <span className="insights-updated">Updated {updated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}</div>
    {error ? <p className="insights-error" role="alert">{error} Try refreshing conditions.</p> : !data ? <p role="status">Loading hourly air and weather data…</p> : <><p className="insights-source">Model estimates, not station measurements · Times: {data.timezone} · Refreshes hourly. Forecasts can change. Sources: <a href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noreferrer">Open-Meteo air quality / CAMS</a> and <a href="https://open-meteo.com/en/docs" target="_blank" rel="noreferrer">Open-Meteo weather</a>.</p><div className="insights-grid">{charts.map(metric => <Chart key={metric.key} points={data.points} metric={metric} currentTime={data.currentTime}/>)}<AirTemperatureScatter points={data.points}/><AqiDistribution points={data.points}/></div><details className="insights-table"><summary>View hourly values as a table</summary><div className="insights-table-scroll"><table><thead><tr><th>Local time</th><th>US AQI</th><th>PM2.5 µg/m³</th><th>PM10 µg/m³</th><th>Temperature °C</th><th>Humidity %</th><th>Wind km/h</th></tr></thead><tbody>{data.points.map(p => <tr key={p.time}><th scope="row">{p.time.replace('T', ' ')}</th>{[p.aqi,p.pm25,p.pm10,p.temperature,p.humidity,p.wind].map((v,i)=><td key={i}>{v ?? '—'}</td>)}</tr>)}</tbody></table></div></details></>}
  </section>;
}
