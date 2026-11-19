import React from 'react';
import { Location } from '../domain/types';
import { MOCK_LOCATIONS } from '../services/mockData';

interface LocationSelectorProps {
  selectedLocation: Location;
  onSelectLocation: (location: Location) => void;
  disabled?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocation,
  onSelectLocation,
  disabled = false,
}) => {
  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div className="card-header">
        <h2 className="card-title">1. Target Location & Topography</h2>
        {selectedLocation.isValleyOrBasin && (
          <span
            className="badge"
            style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fca5a5',
            }}
            title="Valley basins trap cold surface air creating temperature inversions"
          >
            Valley / Basin Topography
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="location-select" className="form-label">
          Select Monitored Urban Area:
        </label>
        <select
          id="location-select"
          className="form-select"
          value={selectedLocation.id}
          onChange={(e) => {
            const loc = MOCK_LOCATIONS.find((l) => l.id === e.target.value);
            if (loc) onSelectLocation(loc);
          }}
          disabled={disabled}
          aria-describedby="location-help"
        >
          {MOCK_LOCATIONS.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name} — {loc.country} ({loc.isValleyOrBasin ? 'Valley Basin' : 'Open Terrain'})
            </option>
          ))}
        </select>
        <p
          id="location-help"
          style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '6px' }}
        >
          Coordinates: {selectedLocation.coordinates.latitude.toFixed(4)}°N,{' '}
          {selectedLocation.coordinates.longitude.toFixed(4)}°E | Elevation:{' '}
          {selectedLocation.elevationMeters ?? 'N/A'} m
        </p>
      </div>
    </div>
  );
};
