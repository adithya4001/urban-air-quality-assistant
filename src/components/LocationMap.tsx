import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '../domain/types';

export function LocationMap({ location, onPick }: { location: Location; onPick: (latitude: number, longitude: number) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const onPickRef = useRef(onPick); onPickRef.current = onPick;
  useEffect(() => {
    if (!container.current) return;
    const map = L.map(container.current).setView([location.coordinates.latitude, location.coordinates.longitude], 13);
    const streets = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom: 19 });
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri and contributors', maxZoom: 19 });
    streets.addTo(map); L.control.layers({ 'Street map': streets, 'Satellite': satellite }, undefined, { collapsed: false }).addTo(map);
    markerRef.current = L.circleMarker([location.coordinates.latitude, location.coordinates.longitude], { radius: 9, color: '#fff', weight: 3, fillColor: '#16836b', fillOpacity: 1 }).addTo(map);
    map.on('click', event => onPickRef.current(event.latlng.lat, event.latlng.lng));
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
  }, []);
  useEffect(() => { const pos: L.LatLngExpression = [location.coordinates.latitude, location.coordinates.longitude]; markerRef.current?.setLatLng(pos); mapRef.current?.setView(pos, Math.max(mapRef.current.getZoom(), 14)); }, [location.coordinates.latitude, location.coordinates.longitude]);
  return <div ref={container} className="location-leaflet-map" role="region" aria-label="Interactive location map. Click to choose a place, or use search." />;
}
