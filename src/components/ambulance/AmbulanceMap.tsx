'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
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

interface Props {
  hospitalCoords: [number, number];
  onRouteCalculated: (distanceKm: number, destination: [number, number]) => void;
}

export default function AmbulanceMap({ hospitalCoords, onRouteCalculated }: Props) {
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

  const MapClickHandler = () => {
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
            const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
            setRouteCoords(coords);
            onRouteCalculated(distance, dest);
          }
        } catch (error) {
          console.error('Error fetching route:', error);
        }
      },
    });
    return null;
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer center={hospitalCoords} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={hospitalCoords} icon={icon} />
        {destination && <Marker position={destination} icon={icon} />}
        {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" />}
        <MapClickHandler />
      </MapContainer>
    </div>
  );
}
