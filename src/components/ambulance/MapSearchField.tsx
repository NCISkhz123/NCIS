"use client";

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

interface Props {
  onLocationFound?: (lat: number, lng: number) => void;
}

export default function MapSearchField({ onLocationFound }: Props) {
  const map = useMap();
  
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new (GeoSearchControl as any)({
      provider: provider,
      style: 'bar',
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: 'Cari alamat atau lokasi...'
    });
    
    map.addControl(searchControl);
    
    const handleLocationFound = (result: any) => {
      if (onLocationFound && result && result.location) {
        // leaflet-geosearch returns x as lng, y as lat
        onLocationFound(result.location.y, result.location.x);
      }
    };
    
    map.on('geosearch/showlocation', handleLocationFound);
    
    return () => {
      map.removeControl(searchControl);
      map.off('geosearch/showlocation', handleLocationFound);
    };
  }, [map, onLocationFound]);
  
  return null;
}
