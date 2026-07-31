'use client';

import dynamic from 'next/dynamic';
import type { AmbulanceMapProps } from './AmbulanceMapInner';

const AmbulanceMapInner = dynamic(() => import('./AmbulanceMapInner'), {
  ssr: false,
});

export default function AmbulanceMap(props: AmbulanceMapProps) {
  return <AmbulanceMapInner {...props} />;
}
