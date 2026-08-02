'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue in Next.js
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

function MapClickHandler({
  hospitalCoords,
  setDestination,
  setRouteCoords,
  onRouteCalculated
}: {
  hospitalCoords: [number, number];
  setDestination: (dest: [number, number]) => void;
  setRouteCoords: (coords: [number, number][]) => void;
  onRouteCalculated: (distanceKm: number, dest: [number, number]) => void;
}) {
  useMapEvents({
    click: async (e) => {
      const dest: [number, number] = [e.latlng.lat, e.latlng.lng];
      setDestination(dest);
      
      // Fetch OSRM route
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${hospitalCoords[1]},${hospitalCoords[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`;
      try {
        const res = await fetch(osrmUrl);
        const data = await res.json();
        if (data.routes && data.routes[0]) {
          const distance = data.routes[0].distance / 1000; // meters to km
          const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
          setRouteCoords(coords);
          onRouteCalculated(distance, dest);
        } else {
          // Fallback straight-line distance if OSRM fails
          const radlat1 = (Math.PI * hospitalCoords[0]) / 180;
          const radlat2 = (Math.PI * dest[0]) / 180;
          const theta = hospitalCoords[1] - dest[1];
          const radtheta = (Math.PI * theta) / 180;
          let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
          dist = Math.acos(Math.min(dist, 1));
          dist = (dist * 180) / Math.PI;
          dist = dist * 60 * 1.1515 * 1.609344;
          setRouteCoords([hospitalCoords, dest]);
          onRouteCalculated(dist, dest);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        // Direct line fallback on network error
        const dx = (hospitalCoords[0] - dest[0]) * 111;
        const dy = (hospitalCoords[1] - dest[1]) * 111;
        const approxDist = Math.sqrt(dx * dx + dy * dy);
        setRouteCoords([hospitalCoords, dest]);
        onRouteCalculated(approxDist, dest);
      }
    },
  });
  return null;
}

export interface AmbulanceMapProps {
  hospitalCoords: [number, number];
  onRouteCalculated: (distanceKm: number, destination: [number, number]) => void;
}

export default function AmbulanceMapInner({ hospitalCoords: rawCoords, onRouteCalculated }: AmbulanceMapProps) {
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

  // Sanitize coordinates: If coordinates are [0,0] or invalid (ocean/null island), fallback to Jakarta [-6.200000, 106.816666]
  const isValidCoords = rawCoords && Array.isArray(rawCoords) && rawCoords.length === 2 && (Math.abs(rawCoords[0]) > 0.001 || Math.abs(rawCoords[1]) > 0.001);
  const hospitalCoords: [number, number] = isValidCoords ? rawCoords : [-6.200000, 106.816666];

  return (
    <div style={{ height: '100%', width: '100%', minHeight: '520px' }}>
      <MapContainer center={hospitalCoords} zoom={13} style={{ height: '100%', width: '100%', minHeight: '520px' }}>
        <MapResizeFix />
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
          maxZoom={19}
        />
        <Marker position={hospitalCoords} icon={icon} />
        {destination && <Marker position={destination} icon={icon} />}
        {routeCoords.length > 0 && <Polyline positions={routeCoords} color="#0284c7" weight={5} opacity={0.8} />}
        <MapClickHandler
          hospitalCoords={hospitalCoords}
          setDestination={setDestination}
          setRouteCoords={setRouteCoords}
          onRouteCalculated={onRouteCalculated}
        />
      </MapContainer>
    </div>
  );
}
