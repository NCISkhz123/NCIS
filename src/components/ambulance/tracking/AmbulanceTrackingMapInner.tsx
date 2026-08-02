'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const hospitalIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function MapFitBounds({ hospitalCoords, destCoords }: { hospitalCoords: [number, number]; destCoords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      const bounds = L.latLngBounds([hospitalCoords, destCoords]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }, 200);
    return () => clearTimeout(timer);
  }, [map, hospitalCoords, destCoords]);
  return null;
}

export interface AmbulanceTrackingMapInnerProps {
  hospitalCoords: [number, number];
  destCoords: [number, number];
}

export default function AmbulanceTrackingMapInner({ hospitalCoords, destCoords }: AmbulanceTrackingMapInnerProps) {
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([hospitalCoords, destCoords]);

  useEffect(() => {
    async function fetchRoute() {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${hospitalCoords[1]},${hospitalCoords[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`;
      try {
        const res = await fetch(osrmUrl);
        const data = await res.json();
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
          setRouteCoords(coords);
        }
      } catch (err) {
        console.error("OSRM Route fetch error:", err);
      }
    }
    fetchRoute();
  }, [hospitalCoords, destCoords]);

  return (
    <div style={{ height: '100%', width: '100%', minHeight: '520px' }}>
      <MapContainer center={hospitalCoords} zoom={13} style={{ height: '100%', width: '100%', minHeight: '520px' }}>
        <MapFitBounds hospitalCoords={hospitalCoords} destCoords={destCoords} />
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
          maxZoom={19}
        />
        <Marker position={hospitalCoords} icon={hospitalIcon}>
          <Popup>
            <div className="font-sans text-xs">
              <strong className="block text-slate-900 font-bold">Pangkalan Utama RS</strong>
              <span className="text-slate-500">Titik Keberangkatan & Kepulangan</span>
            </div>
          </Popup>
        </Marker>
        <Marker position={destCoords} icon={hospitalIcon}>
          <Popup>
            <div className="font-sans text-xs">
              <strong className="block text-rose-600 font-bold">Lokasi Penjemputan / Tujuan</strong>
              <span className="text-slate-500">Koordinat Pasien Darurat</span>
            </div>
          </Popup>
        </Marker>
        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords} color="#0284c7" weight={6} opacity={0.85} dashArray="8, 12" />
        )}
      </MapContainer>
    </div>
  );
}
