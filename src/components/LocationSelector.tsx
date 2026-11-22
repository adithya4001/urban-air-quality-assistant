import React, { useState } from 'react';
import { Location } from '../domain/types';
import { MOCK_LOCATIONS } from '../services/mockData';

interface LocationSelectorProps {
  selectedLocation: Location;
  onSelectLocation: (location: Location, permanent: boolean) => void;
  onRestoreLocation: () => void;
}

interface PlaceResult {
  id: number;
  name: string;
  admin1?: string;
  admin2?: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  country_code: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ selectedLocation, onSelectLocation, onRestoreLocation }) => {
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [message, setMessage] = useState('');
  const [searching, setSearching] = useState(false);
  const [permanent, setPermanent] = useState(false);
  const [listening, setListening] = useState(false);

  function useCurrentLocation() {
    if (!navigator.geolocation) { setMessage('Your browser does not support location.'); return; }
    setMessage('Requesting your location…');
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const { latitude, longitude } = coords;
      onSelectLocation({ id: `coordinates-${latitude.toFixed(4)}-${longitude.toFixed(4)}`, name: `Current location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`, city: 'Current location', country: 'Selected coordinates', coordinates: { latitude, longitude } }, permanent);
      setMessage(permanent ? 'Current location saved in this browser.' : 'Current location selected for this session.');
    }, () => setMessage('Location unavailable or permission denied. You can search for a place instead.'), { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  }

  function voiceSearch() {
    type SpeechResult = { transcript: string };
    type Recognition = { lang: string; start: () => void; onresult: ((event: { results: ArrayLike<ArrayLike<SpeechResult>> }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null };
    const browser = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const Constructor = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!Constructor) { setMessage('Voice input is not supported in this browser. Please type a location.'); return; }
    const recognition = new Constructor(); recognition.lang = 'en-IN';
    recognition.onresult = event => { setQuery(event.results[0][0].transcript); setMessage('Location heard. Review the name and choose Search.'); };
    recognition.onerror = () => setMessage('Could not hear your location. Try again or type it.');
    recognition.onend = () => setListening(false);
    try { recognition.start(); setListening(true); setMessage('Listening for a city name…'); } catch { setMessage('Voice input could not start.'); }
  }

  async function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = query.trim();
    if (searching || name.length < 2) return;
    setSearching(true);
    setPlaces([]);
    setMessage('Searching Indian locations…');

    try {
      const params = new URLSearchParams({ name, countryCode: 'IN', count: '12' });
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error('Location search failed');
      const payload = await response.json() as { results?: PlaceResult[] };
      const results = (payload.results ?? []).filter((place) =>
        place.country_code === 'IN' && Number.isFinite(place.latitude) && Number.isFinite(place.longitude),
      );
      setPlaces(results);
      setMessage(results.length ? `${results.length} results. Choose a location below.` : 'No match. Try a nearby town or add the state name.');
    } catch {
      setMessage('Location search is temporarily unavailable. Try again or choose a preset.');
    } finally {
      setSearching(false);
    }
  }

  return (
    <section className="card workspace-location" aria-labelledby="location-title">
      <h2 id="location-title" className="card-title">Find your location</h2>
      <p className="section-copy">Selected: {selectedLocation.name}, {selectedLocation.country}</p>
      <fieldset className="location-duration"><legend>How long?</legend><label><input type="radio" name="location-duration" checked={!permanent} onChange={() => setPermanent(false)} /> Temporary — this session</label><label><input type="radio" name="location-duration" checked={permanent} onChange={() => setPermanent(true)} /> Save for future visits on this browser</label></fieldset>
      <div className="location-actions"><button className="secondary-button" type="button" onClick={useCurrentLocation}>⌖ Use current location</button><button className="secondary-button" type="button" onClick={voiceSearch} disabled={listening}>{listening ? 'Listening…' : '🎙 Speak a city'}</button><button className="secondary-button" type="button" onClick={onRestoreLocation}>Use saved location</button></div>
      <form className="workspace-location-form" onSubmit={search}>
        <label htmlFor="india-search" className="form-label">Indian city, town or PIN code</label>
        <div className="assistant-form">
          <input id="india-search" className="form-input assistant-input" value={query}
            onChange={(event) => setQuery(event.target.value)} placeholder="e.g. Guwahati or Kochi, Kerala"
            maxLength={100} readOnly={searching} />
          <button className="primary-button" type="submit" disabled={searching || query.trim().length < 2}>Search</button>
        </div>
      </form>
      <p className="section-copy" role="status">{message}</p>
      {places.length > 0 && (
        <ul className="workspace-places">
          {places.map((place) => {
            const id = `india-${place.id}`;
            const name = [...new Set([place.name, place.admin2, place.admin1].filter(Boolean))].join(', ');
            return (
              <li key={id}>
                <button className="secondary-button" type="button" aria-pressed={selectedLocation.id === id}
                  onClick={() => onSelectLocation({
                    id, name, city: place.name, country: 'India',
                    coordinates: { latitude: place.latitude, longitude: place.longitude },
                    elevationMeters: place.elevation,
                  }, permanent)}>
                  {name}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <details className="workspace-presets">
        <summary>Browse preset locations</summary>
        <label htmlFor="location-select" className="form-label">Preset city</label>
        <select id="location-select" className="form-select"
          value={MOCK_LOCATIONS.some(({ id }) => id === selectedLocation.id) ? selectedLocation.id : ''}
          onChange={(event) => {
            const location = MOCK_LOCATIONS.find(({ id }) => id === event.target.value);
            if (location) onSelectLocation(location, permanent);
          }}>
          <option value="" disabled>Choose a preset</option>
          {MOCK_LOCATIONS.map(({ id, name, country }) => <option key={id} value={id}>{name} · {country}</option>)}
        </select>
      </details>
      <p className="muted-note">Location search by Open-Meteo and GeoNames.</p>
    </section>
  );
};
