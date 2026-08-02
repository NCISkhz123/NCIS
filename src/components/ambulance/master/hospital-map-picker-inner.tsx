"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

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
  const isValidLat = typeof lat === 'number' && Math.abs(lat) > 0.001;
  const isValidLng = typeof lng === 'number' && Math.abs(lng) > 0.001;
  const defaultLat = isValidLat ? lat : -6.200000;
  const defaultLng = isValidLng ? lng : 106.816666;
  const position: [number, number] = [defaultLat, defaultLng];

  return (
    <div style={{ height: '380px', width: '100%', borderRadius: '0.75rem', overflow: 'hidden' }}>
      <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
        <MapResizeFix />
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
          maxZoom={19}
        />
        <Marker position={position} icon={icon} />
        <MapClickHandler setPos={onChange} />
      </MapContainer>
    </div>
  );
}
