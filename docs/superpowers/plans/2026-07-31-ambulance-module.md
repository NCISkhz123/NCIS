# Ambulance Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Ambulance ordering module where users can select a car in a marketplace-style view, pick a destination on a map, and calculate costs based on driving distance.

**Architecture:** Supabase will store master data (ambulances, hospital settings) and transaction history. Next.js App Router will serve the UI. `react-leaflet` and Leaflet will render OpenStreetMap tiles, while OSRM's public API will calculate driving distance.

**Tech Stack:** Next.js (App Router), React, TailwindCSS, Shadcn/UI, Supabase (PostgreSQL), Leaflet, React-Leaflet.

## Global Constraints

- Code must use TypeScript and follow the existing App Router conventions.
- React-Leaflet requires disabling SSR for the map component (using `next/dynamic` with `ssr: false`).
- Use existing Shadcn/UI components where possible; install new ones using `npx shadcn@latest add <component>` if needed.

## User Review Required

> [!IMPORTANT]
> - **Map Package Installation**: We will install `leaflet`, `react-leaflet`, and their types.
> - **Public OSRM API**: The plan uses the free public OSRM server (`router.project-osrm.org`) which is strictly for non-commercial/testing use. For a production hospital system, you might need to host your own OSRM instance later, but the code will easily adapt to a custom URL.
> - **File Path**: The plan is saved to `docs/superpowers/plans/2026-07-31-ambulance-module.md`. 

---

### Task 1: Database Migration for Ambulance Module

**Files:**
- Create: `supabase/migrations/202607310002_ambulance_module.sql`
- Create: `tests/integration/ambulance_db.test.js`

**Interfaces:**
- Produces: Tables `ambulances`, `ambulance_settings`, `ambulance_transactions` with RLS policies.

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/202607310002_ambulance_module.sql

CREATE TABLE ambulances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    plate_number TEXT NOT NULL,
    base_price_per_km NUMERIC NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ambulance_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_lat NUMERIC NOT NULL,
    hospital_lng NUMERIC NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ambulance_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ambulance_id UUID REFERENCES ambulances(id) NOT NULL,
    destination_lat NUMERIC NOT NULL,
    destination_lng NUMERIC NOT NULL,
    distance_km NUMERIC NOT NULL,
    total_cost NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Basic RLS (Enable and add policies as per project standards)
ALTER TABLE ambulances ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambulance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambulance_transactions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write for MVP (adjust policies if role-based is needed)
CREATE POLICY "Allow authenticated read on ambulances" ON ambulances FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated all on ambulances" ON ambulances FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated read on ambulance_settings" ON ambulance_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated all on ambulance_settings" ON ambulance_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated read on ambulance_transactions" ON ambulance_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on ambulance_transactions" ON ambulance_transactions FOR INSERT TO authenticated WITH CHECK (true);
```

- [ ] **Step 2: Apply migration and generate types**

Run: `supabase db reset` or `supabase migration up` (depending on local environment status).
Run: `npx supabase gen types typescript --local > src/types/supabase.ts` (assuming this is how types are generated here).

### Task 2: Install Map Dependencies

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: `leaflet`, `react-leaflet`, `@types/leaflet` installed.

- [ ] **Step 1: Install packages**

Run: `npm install leaflet react-leaflet`
Run: `npm install -D @types/leaflet`

- [ ] **Step 2: Commit changes**

```bash
git add package.json package-lock.json
git commit -m "chore: add leaflet dependencies for ambulance module"
```

### Task 3: Create Map Component (Client-Side Only)

**Files:**
- Create: `src/components/ambulance/AmbulanceMap.tsx`

**Interfaces:**
- Consumes: Leaflet library.
- Produces: `AmbulanceMap` component that takes `hospitalCoords`, `onDestinationSelect`, and draws OSRM route.

- [ ] **Step 1: Write the AmbulanceMap component**

```tsx
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
```

### Task 4: Ambulance Master Data Page

**Files:**
- Create: `src/app/(protected)/ambulance/master/page.tsx`

**Interfaces:**
- Consumes: Supabase API for `ambulances` and `ambulance_settings`.
- Produces: UI to add/edit cars and set hospital coordinates.

- [ ] **Step 1: Write the master page UI**
(Implement a standard data table fetching `ambulances` and a settings form for `ambulance_settings` using Shadcn forms/tables).

- [ ] **Step 2: Test rendering**
Run: `npm run dev` and navigate to `/ambulance/master` to ensure it renders correctly.

### Task 5: Ambulance Ordering Wizard (Step 1 - Car Selection)

**Files:**
- Create: `src/app/(protected)/ambulance/order/page.tsx`

**Interfaces:**
- Consumes: `ambulances` from Supabase.
- Produces: Wizard state managing selected car.

- [ ] **Step 1: Write the car list UI**
(Implement a grid showing cars, with a "Pilih" button that sets the active car state and moves to Step 2).

### Task 6: Ambulance Ordering Wizard (Step 2 - Map & Checkout)

**Files:**
- Modify: `src/app/(protected)/ambulance/order/page.tsx`

**Interfaces:**
- Consumes: `AmbulanceMap` component, selected car state.
- Produces: Cost calculation and `ambulance_transactions` insert.

- [ ] **Step 1: Integrate Map and dynamic import**

```tsx
import dynamic from 'next/dynamic';
// Must use dynamic import with ssr: false for react-leaflet
const MapComponent = dynamic(() => import('@/components/ambulance/AmbulanceMap'), { ssr: false });
```

- [ ] **Step 2: Add cost calculation and submit button**
(When `onRouteCalculated` fires, multiply `distanceKm` by `selectedCar.base_price_per_km`. Show total. On submit, insert to `ambulance_transactions`).

### Task 7: Ambulance History Page

**Files:**
- Create: `src/app/(protected)/ambulance/history/page.tsx`

**Interfaces:**
- Consumes: `ambulance_transactions` joined with `ambulances`.
- Produces: Filterable data table.

- [ ] **Step 1: Write history page**
(Implement a data table showing transaction history, similar to existing CSSD/Laundry history).
