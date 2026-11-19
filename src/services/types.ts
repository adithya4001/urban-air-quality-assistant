import { AirQualitySnapshot, DataSource, Location, WeatherSnapshot } from '../domain/types';

export interface IAirQualityProvider {
  readonly providerName: string;
  getAirQuality(location: Location): Promise<AirQualitySnapshot>;
}

export interface IWeatherProvider {
  readonly providerName: string;
  getWeather(location: Location): Promise<WeatherSnapshot>;
}

export interface EnvironmentalContextResult {
  airQuality: AirQualitySnapshot;
  weather: WeatherSnapshot;
  isFallback: boolean;
  fallbackReason?: string;
  dataSource: DataSource;
  dataAttribution?: string;
}

export interface IEnvironmentService {
  getEnvironmentalContext(location: Location, forceFallback?: boolean): Promise<EnvironmentalContextResult>;
}
