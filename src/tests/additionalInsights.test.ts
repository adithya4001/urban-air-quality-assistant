import { describe, expect, it } from 'vitest';
import { aggregateDaily, dailyAqi } from '../components/AdditionalInsights';
import { rankInsightPoints } from '../components/AirInsightsDashboard';
import type { HourlyPoint } from '../services/HourlyInsights';
const row=(time:string,aqi:number|null):HourlyPoint=>({time,aqi,pm25:null,pm10:null,temperature:null,humidity:null,wind:null});
describe('daily insights',()=>{
  it('groups only available values by date and keeps missing metrics missing',()=>{
    const rows=[row('2026-11-01T00:00',100),row('2026-11-01T01:00',140),row('2026-11-02T00:00',null)];
    expect(aggregateDaily(rows)).toMatchObject([{aqi:120,pm25:null},{aqi:null}]);
    expect(dailyAqi(rows)).toEqual([{date:'2026-11-01',min:100,max:140,avg:120}]);
  });
  it('does not mutate source points and averages each available metric independently',()=>{
    const rows=[
      {...row('2026-11-01T00:00',80),pm25:10,temperature:20},
      {...row('2026-11-01T01:00',null),pm25:30,temperature:null},
    ];
    const original=rows.map(point=>({...point}));
    expect(aggregateDaily(rows)[0]).toMatchObject({aqi:80,pm25:20,temperature:20,humidity:null});
    expect(rows).toEqual(original);
  });
  it('ranks the full range before applying the selected top-N limit',()=>{
    const rows=[row('2026-11-01T00:00',100),row('2026-11-01T01:00',20),row('2026-11-01T02:00',80),row('2026-11-01T03:00',null)];
    expect(rankInsightPoints(rows,2,'lowest').map(point=>point.aqi)).toEqual([20,80]);
    expect(rankInsightPoints(rows,2,'highest').map(point=>point.aqi)).toEqual([100,80]);
    expect(rankInsightPoints(rows,2,'oldest').map(point=>point.time)).toEqual(['2026-11-01T00:00','2026-11-01T01:00']);
  });
});
