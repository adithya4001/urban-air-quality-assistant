import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '../domain/types';

export function LocationMap({ location, savedPlaces, onPick }: { location: Location | null; savedPlaces: Array<{label:string;location:Location}>; onPick: (latitude: number, longitude: number) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const savedRef = useRef<L.LayerGroup | null>(null);
  const onPickRef = useRef(onPick); onPickRef.current = onPick;
  useEffect(() => {
    if (!container.current) return;
    const map = L.map(container.current).setView(location ? [location.coordinates.latitude, location.coordinates.longitude] : [20.5937, 78.9629], location ? 13 : 5);
    const streets = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom: 19 });
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Imagery &copy; Esri and contributors', maxZoom: 19 });
    const labels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { attribution: 'Labels &copy; Esri and contributors', maxZoom: 19 });
    streets.addTo(map); L.control.layers({ 'Street map': streets, 'Satellite with labels': L.layerGroup([satellite, labels]) }, undefined, { collapsed: false }).addTo(map);
    markerRef.current = L.circleMarker([0,0], { radius: 9, color: '#fff', weight: 3, fillColor: '#16836b', fillOpacity: 1 });
    savedRef.current = L.layerGroup().addTo(map);
    map.on('click', event => onPickRef.current(event.latlng.lat, event.latlng.lng));
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
  }, []);
  useEffect(() => { if (!location || !mapRef.current || !markerRef.current) return; const pos: L.LatLngExpression = [location.coordinates.latitude, location.coordinates.longitude]; markerRef.current.setLatLng(pos).addTo(mapRef.current); mapRef.current.setView(pos, Math.max(mapRef.current.getZoom(), 14)); }, [location?.coordinates.latitude, location?.coordinates.longitude]);
  useEffect(() => { const group = savedRef.current; if (!group) return; group.clearLayers(); for (const place of savedPlaces) { const marker = L.circleMarker([place.location.coordinates.latitude, place.location.coordinates.longitude], { radius: 7, color: '#fff', weight: 2, fillColor: '#c67943', fillOpacity: 1 }); const text = document.createElement('span'); text.textContent = `${place.label}: ${place.location.name}`; marker.bindTooltip(text); marker.addTo(group); } }, [savedPlaces]);
  return <div ref={container} className="location-leaflet-map" role="region" aria-label="Interactive location map. Click to choose a place, or use search." />;
}
