import React, { useEffect, useMemo, useState } from 'react';
import type { Location } from '../domain/types';
import { fetchHourlyInsights, type HourlyPoint } from '../services/HourlyInsights';
import './AirInsightsDashboard.css';
import { AdditionalInsights, aggregateDaily } from './AdditionalInsights';
import type { InsightPeriod } from '../services/HourlyInsights';

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
  const counts = bands.map(b => ({ ...b, count: 0 }));
  let valueCount = 0;
  for (const point of points) {
    if (point.aqi === null || point.aqi < 0) continue;
    valueCount += 1;
    const bandIndex = bands.findIndex(band => point.aqi! <= band.max);
    if (bandIndex >= 0) counts[bandIndex].count += 1;
  }
  let offset = 0;
  return <article className="insight-chart"><div className="insight-chart-heading"><div><span className="insight-metric-unit">US AQI · selected hours</span><h3>Hours by air quality</h3></div><strong>{valueCount}</strong></div><p>Number of available hourly estimates in each US AQI band. This is not a pollution breakdown.</p>{valueCount ? <div className="insights-donut-layout"><svg viewBox="0 0 120 120" role="img" aria-label={`Distribution of ${valueCount} hourly US AQI estimates. See legend for counts.`}><circle cx="60" cy="60" r="42" fill="none" stroke="#e9f0ec" strokeWidth="14" />{counts.map(b => { const fraction = b.count / valueCount; const start = offset; offset += fraction; return fraction ? <circle key={b.label} cx="60" cy="60" r="42" pathLength="100" fill="none" stroke={b.color} strokeWidth="14" strokeDasharray={`${fraction * 100} ${100 - fraction * 100}`} strokeDashoffset={-start * 100} transform="rotate(-90 60 60)"><title>{b.label}: {b.count} hours</title></circle> : null; })}<text x="60" y="65" textAnchor="middle" fontSize="15" fill="#285c50">{valueCount}h</text></svg><ul>{counts.filter(b => b.count > 0).map(b => <li key={b.label}><span style={{ background: b.color }} />{b.label}: {b.count}h</li>)}</ul></div> : <p>No AQI estimates are available.</p>}</article>;
}

function Chart({ points, metric, currentTime, period }: { points: HourlyPoint[]; metric: typeof charts[number]; currentTime: string; period: InsightPeriod }) {
  const vals = points.map(p => p[metric.key]); const valid = vals.filter((v): v is number => v !== null);
  if (!valid.length) return <article className="insight-chart"><h3>{metric.title}</h3><p>Data unavailable for this metric.</p></article>;
  const min = Math.min(0, ...valid); const max = Math.max(1, ...valid); const range = Math.max(1, max - min);
  const x = (i: number) => 8 + i * (284 / Math.max(1, points.length - 1));
  const y = (v: number) => 108 - ((v - min) / range) * 92;
  const segments: string[][] = []; let segment: string[] = [];
  vals.forEach((value, i) => { if (value === null) { if (segment.length) segments.push(segment); segment = []; } else segment.push(`${x(i)},${y(value)}`); });
  if (segment.length) segments.push(segment);
  const currentIndex = points.findIndex(p => p.time.slice(0, 13) === currentTime.slice(0, 13));
  const current = currentIndex >= 0 ? vals[currentIndex] : vals[vals.length-1];
  const label = (time: string) => `${time.slice(5, 10)} ${time.slice(11, 16)}`;
  return <article className="insight-chart"><div className="insight-chart-heading"><div><span className="insight-metric-unit">{metric.unit}</span><h3>{metric.title}</h3></div><strong>{current === null ? '—' : Math.round(current * 10) / 10}</strong></div><p>{metric.description} {period !== 'hourly' && 'Daily averages; latest day may be partial.'}</p>
    <svg viewBox="0 0 300 130" role="img" aria-label={`${metric.title}, model estimates from ${label(points[0].time)} to ${label(points[points.length - 1].time)}. See data table for values.`}>
      <line x1="8" y1="108" x2="292" y2="108" stroke="#cfdfda"/><line x1="8" y1="62" x2="292" y2="62" stroke="#e7efeb" strokeDasharray="3 5"/>
      {currentIndex >= 0 && <line x1={x(currentIndex)} y1="8" x2={x(currentIndex)} y2="108" stroke="#7a9992" strokeDasharray="3 4"/>}
      {metric.kind === 'bars' ? vals.map((v, i) => v === null ? null : <rect key={points[i].time} x={x(i) - 4} y={y(v)} width="8" height={Math.max(1, 108 - y(v))} rx="3" fill={metric.color} opacity=".8"><title>{`${label(points[i].time)}: ${v} ${metric.unit}`}</title></rect>) : segments.map((s, i) => <g key={i}>{metric.kind === 'area' && s.length > 1 && <polygon points={`${s[0].split(',')[0]},108 ${s.join(' ')} ${s[s.length - 1].split(',')[0]},108`} fill={metric.color} opacity=".14"/>}<polyline points={s.join(' ')} fill="none" stroke={metric.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/></g>)}
      {vals.map((v,i)=>v===null?null:<circle key={points[i].time} cx={x(i)} cy={y(v)} r="3" fill={metric.color} tabIndex={0}><title>{`${points[i].time.replace('T',' ')}: ${v} ${metric.unit}`}</title></circle>)}
      <text x="8" y="125" fontSize="9" fill="#62847f">{label(points[0].time)}</text><text x="292" y="125" textAnchor="end" fontSize="9" fill="#62847f">{label(points[points.length - 1].time)}</text>
    </svg>
  </article>;
}

export function rankInsightPoints(points: HourlyPoint[], topN: number, sort: string) {
  const comparator = sort === 'lowest'
    ? (a: HourlyPoint & { aqi: number }, b: HourlyPoint & { aqi: number }) => a.aqi - b.aqi
    : sort === 'oldest'
      ? (a: HourlyPoint, b: HourlyPoint) => a.time.localeCompare(b.time)
      : sort === 'newest'
        ? (a: HourlyPoint, b: HourlyPoint) => b.time.localeCompare(a.time)
        : (a: HourlyPoint & { aqi: number }, b: HourlyPoint & { aqi: number }) => b.aqi - a.aqi;
  return points
    .filter((point): point is HourlyPoint & { aqi: number } => point.aqi !== null)
    .sort(comparator)
    .slice(0, topN);
}

function RankedBars({points,topN,sort}:{points:HourlyPoint[];topN:number;sort:string}){
 const ranked=rankInsightPoints(points,topN,sort);const max=Math.max(1,...ranked.map(p=>p.aqi));
 const orderLabel=sort==='lowest'?'lowest':sort==='oldest'?'oldest':sort==='newest'?'newest':'highest';
 return <article className="insight-chart"><span className="insight-metric-unit">US AQI · TOP {topN}</span><h3>Ranked AQI periods</h3><p>Top {topN} {orderLabel} values in the selected range. Longer ranges use daily averages.</p><div className="ranked-bars">{ranked.map(p=><div key={p.time}><span>{p.time.replace('T',' ')}</span><div className="ranked-track"><div style={{width:(p.aqi/max*100)+'%'}} title={p.aqi+' US AQI'}/></div><strong>{p.aqi}</strong></div>)}</div>{!ranked.length&&<p>No values available.</p>}</article>
}

export function AirInsightsDashboard({ location, refreshNonce }: { location: Location; refreshNonce: number }) {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchHourlyInsights>> | null>(null);
  const [period, setPeriod] = useState<InsightPeriod>('hourly'); const [topN, setTopN] = useState(5); const [sort, setSort] = useState('highest'); const [metricKey, setMetricKey] = useState<Key>('aqi');
  const [error, setError] = useState(''); const [updated, setUpdated] = useState<Date | null>(null);
  const [tableOpen, setTableOpen] = useState(false);
  useEffect(() => { const controller = new AbortController(); setData(null); setError(''); fetchHourlyInsights(location, controller.signal, period).then(result => { setData(result); setUpdated(new Date()); }).catch(err => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Hourly data is unavailable.'); }); return () => controller.abort(); }, [location.coordinates.latitude, location.coordinates.longitude, refreshNonce, period]);
  const displayPoints = useMemo(() => data ? (period === 'hourly' ? data.points : aggregateDaily(data.points)) : [], [data, period]);
  return <section className="insights-analytics" aria-label="Air and weather analytics"><div className="insights-analytics-heading"><div><span className="daily-eyebrow">YOUR LOCATION · AIR INSIGHTS</span><h2>See how your air changes</h2><p>Explore {period === 'hourly' ? 'recent hours and upcoming forecast' : period === 'weekly' ? 'the past seven days' : 'the past 30 days'} for {location.name}. Historical views show modelled estimates, not future forecasts.</p></div>{updated && <span className="insights-updated">Updated {updated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}</div>
    <div className="insights-filters"><label>Time range <select value={period} onChange={e=>setPeriod(e.target.value as InsightPeriod)}><option value="hourly">Hourly</option><option value="weekly">Past 7 days</option><option value="monthly">Past 30 days</option></select></label><label>Number of bars <select value={topN} onChange={e=>setTopN(Number(e.target.value))}><option value={3}>Top 3</option><option value={5}>Top 5</option><option value={10}>Top 10</option></select></label><label>Sort bars <select value={sort} onChange={e=>setSort(e.target.value)}><option value="highest">Highest first</option><option value="lowest">Lowest first</option><option value="oldest">Oldest first</option><option value="newest">Newest first</option></select></label><label>Line metric <select value={metricKey} onChange={e=>setMetricKey(e.target.value as Key)}>{charts.map(c=><option key={c.key} value={c.key}>{c.title}</option>)}</select></label></div>
    {error ? <p className="insights-error" role="alert">{error} Try refreshing conditions.</p> : !data ? <p role="status">Loading air and weather data…</p> : <><p className="insights-source">Model estimates, not station measurements · Times: {data.timezone} · Refreshes according to your app settings. Historical periods use available past estimates; the current day can be partial. Forecasts can change. Sources: <a href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noreferrer">Open-Meteo air quality / CAMS</a> and <a href="https://open-meteo.com/en/docs" target="_blank" rel="noreferrer">Open-Meteo weather</a>.</p><div className="insights-grid"><Chart points={displayPoints} metric={{...charts.find(c=>c.key===metricKey)!,kind:'line'}} currentTime={data.currentTime} period={period}/><Chart points={displayPoints} metric={{...charts[1],kind:'area'}} currentTime={data.currentTime} period={period}/><RankedBars points={displayPoints} topN={topN} sort={sort}/><AqiDistribution points={data.points}/><AdditionalInsights points={data.points}/></div><details className="insights-table" onToggle={event => setTableOpen(event.currentTarget.open)}><summary>View available hourly values as a table</summary>{tableOpen && <div className="insights-table-scroll"><table><thead><tr><th>Local time</th><th>US AQI</th><th>PM2.5 µg/m³</th><th>PM10 µg/m³</th><th>Temperature °C</th><th>Humidity %</th><th>Wind km/h</th></tr></thead><tbody>{data.points.map(p => <tr key={p.time}><th scope="row">{p.time.replace('T', ' ')}</th>{[p.aqi,p.pm25,p.pm10,p.temperature,p.humidity,p.wind].map((v,i)=><td key={i}>{v ?? '—'}</td>)}</tr>)}</tbody></table></div>}</details></>}
  </section>;
}
