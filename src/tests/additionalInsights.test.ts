import { describe, expect, it } from 'vitest';
import { aggregateDaily, dailyAqi } from '../components/AdditionalInsights';
import type { HourlyPoint } from '../services/HourlyInsights';
const row=(time:string,aqi:number|null):HourlyPoint=>({time,aqi,pm25:null,pm10:null,temperature:null,humidity:null,wind:null});
describe('daily insights',()=>{it('groups only available values by date and keeps missing metrics missing',()=>{const rows=[row('2026-11-01T00:00',100),row('2026-11-01T01:00',140),row('2026-11-02T00:00',null)];expect(aggregateDaily(rows)).toMatchObject([{aqi:120,pm25:null},{aqi:null}]);expect(dailyAqi(rows)).toEqual([{date:'2026-11-01',min:100,max:140,avg:120}]);});});
