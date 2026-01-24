'use client';

import dynamic from 'next/dynamic';

const DiamondBackground = dynamic(
  () => import('./diamond-background').then((mod) => mod.DiamondBackground),
  { ssr: false }
);

export function DiamondWrapper() {
  return <DiamondBackground />;
}
