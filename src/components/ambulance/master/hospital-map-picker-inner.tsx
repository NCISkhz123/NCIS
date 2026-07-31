"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function MapClickHandler({ setPos }: { setPos: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      setPos(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface Props {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

export default function HospitalMapPickerInner({ lat, lng, onChange }: Props) {
  // Use Jakarta as default if coordinates are not set or 0
  const defaultLat = lat || -6.200000;
  const defaultLng = lng || 106.816666;
  const position: [number, number] = [defaultLat, defaultLng];

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '0.75rem', overflow: 'hidden' }}>
      <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat || defaultLat, lng || defaultLng]} icon={icon} />
        <MapClickHandler setPos={onChange} />
      </MapContainer>
    </div>
  );
}
