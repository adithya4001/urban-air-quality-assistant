import { RiskLevel } from '../domain/types';

export function getRiskLevelLabel(risk: RiskLevel): string {
  switch (risk) {
    case 'low':
      return 'Good (Low Risk)';
    case 'moderate':
      return 'Moderate';
    case 'unhealthy_sensitive':
      return 'Unhealthy for Sensitive Groups';
    case 'unhealthy':
      return 'Unhealthy';
    case 'very_unhealthy':
      return 'Very Unhealthy';
    case 'hazardous':
      return 'Hazardous / Severe Smog';
  }
}

export function getRiskLevelColor(risk: RiskLevel): {
  bg: string;
  text: string;
  border: string;
  badgeBg: string;
} {
  switch (risk) {
    case 'low':
      return {
        bg: '#e8f5e9',
        text: '#1b5e20',
        border: '#81c784',
        badgeBg: '#2e7d32',
      };
    case 'moderate':
      return {
        bg: '#fffde7',
        text: '#f57f17',
        border: '#fff176',
        badgeBg: '#fbc02d',
      };
    case 'unhealthy_sensitive':
      return {
        bg: '#fff3e0',
        text: '#e65100',
        border: '#ffb74d',
        badgeBg: '#f57c00',
      };
    case 'unhealthy':
      return {
        bg: '#fbe9e7',
        text: '#bf360c',
        border: '#ff8a65',
        badgeBg: '#d84315',
      };
    case 'very_unhealthy':
      return {
        bg: '#f3e5f5',
        text: '#4a148c',
        border: '#ba68c8',
        badgeBg: '#7b1fa2',
      };
    case 'hazardous':
      return {
        bg: '#ffebee',
        text: '#b71c1c',
        border: '#e57373',
        badgeBg: '#c62828',
      };
  }
}

export function formatAqi(aqi: number): string {
  return Math.round(aqi).toString();
}

export function formatConcentration(value: number, unit = 'µg/m³'): string {
  return `${value.toFixed(1)} ${unit}`;
}
