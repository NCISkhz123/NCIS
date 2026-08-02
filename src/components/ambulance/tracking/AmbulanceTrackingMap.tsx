'use client';

import dynamic from 'next/dynamic';
import type { AmbulanceTrackingMapInnerProps } from './AmbulanceTrackingMapInner';

const AmbulanceTrackingMapInner = dynamic(() => import('./AmbulanceTrackingMapInner'), {
  ssr: false,
});

export default function AmbulanceTrackingMap(props: AmbulanceTrackingMapInnerProps) {
  return <AmbulanceTrackingMapInner {...props} />;
}
